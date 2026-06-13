/**
 * Academic Chatbot API — powered by Mistral AI
 *
 * Receives the full conversation history plus a rich student-context snapshot
 * and streams back a Mistral response that reasons dynamically over the
 * student's real academic data.
 */

export async function POST(req) {
  try {
    const { messages, context } = await req.json();

    const MISTRAL_KEY = process.env.MISTRAL_API_KEY;
    if (!MISTRAL_KEY) {
      return Response.json(
        { text: "⚠️ The AI engine is not configured. Please add your Mistral API key to .env.local as MISTRAL_API_KEY." },
        { status: 200 }
      );
    }

    // ── Build rich student snapshot for system prompt ─────────────────
    const courseList = (context.courses || [])
      .map(c => `  • ${c.code} — ${c.title}${c.units ? ` (${c.units} units)` : ""}`)
      .join("\n");

    const assignmentList = (context.assignments || [])
      .map(a => {
        const daysLeft = Math.ceil((new Date(a.dueDate) - Date.now()) / 86400000);
        return `  • "${a.title}" (course ${a.courseId}) — ${daysLeft > 0 ? `due in ${daysLeft} day(s)` : "OVERDUE"}, max score ${a.maxScore}`;
      })
      .join("\n");

    const submissionList = (context.submissions || [])
      .map(s => `  • Assignment #${s.assignmentId}: ${s.score !== null && s.score !== undefined ? `scored ${s.score}` : "submitted, awaiting grade"}`)
      .join("\n");

    const quizList = (context.quizResults || [])
      .map(r => {
        const quiz = (context.quizzes || []).find(q => q.id === r.quizId);
        return `  • ${quiz?.title || `Quiz #${r.quizId}`}: scored ${r.score}/${quiz?.questionCount || "?"}`;
      })
      .join("\n");

    const materialList = (context.materials || [])
      .map(m => `  • [${m.type}] "${m.title}" (course ${m.courseId})`)
      .join("\n");

    const systemPrompt = `You are the "Brilliant Academic Agent" of Mountain Top University (MTU).
You are an intelligent, supportive AI tutor embedded inside the student portal.

────────────────────────────────
STUDENT PROFILE (LIVE DATA)
────────────────────────────────
Name: ${context.userName || "Student"}
Program: ${context.program || "N/A"}
Level: ${context.level || "N/A"}

ENROLLED COURSES (${(context.courses || []).length}):
${courseList || "  (none)"}

ACTIVE ASSIGNMENTS (${(context.assignments || []).length}):
${assignmentList || "  (none pending)"}

SUBMISSION HISTORY (${(context.submissions || []).length}):
${submissionList || "  (no submissions yet)"}

QUIZ PERFORMANCE:
${quizList || "  (no quizzes attempted)"}

AVAILABLE COURSE MATERIALS:
${materialList || "  (none uploaded)"}
────────────────────────────────

BEHAVIOURAL RULES:
1. Always reason dynamically from the live data above. Never invent courses, scores, or deadlines the student does not actually have.
2. When the student asks about deadlines, reference their ACTUAL active assignments and compute real days remaining.
3. When asked about progress, analyse their submissions vs. active assignments and quiz scores.
4. If you see a deadline within 2 days, proactively warn them — even if they didn't ask.
5. Suggest specific study strategies based on their weakest areas (fewest submissions, lowest quiz scores).
6. If a student sends an image, analyse it and relate it to their enrolled courses if relevant.
7. You can generate visual aids by including a special tag: IMAGE_GENERATED: <url>. Use Pollinations AI for images: https://pollinations.ai/p/<encoded_prompt>?width=1024&height=1024&nologo=true
8. Maintain a sophisticated, scholarly, yet warm and encouraging tone.
9. Keep responses focused and well-structured. Use bullet points and numbered lists for clarity.
10. If the student asks something unrelated to academics, gently guide them back but still be helpful.
11. CRITICAL: DO NOT use markdown formatting like asterisks (**), hashes (###), or markdown bullet points (- or *). Instead, use simple text formatting, numbered lists (1., 2.), or standard characters (•) for bullet points. Your response is displayed in a plain text view, so markdown symbols will just show up as raw characters.`;

    // ── Convert chat history to Mistral message format ────────────────
    const mistralMessages = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history. Mistral requires that, after the optional
    // system message, the first turn be a user message and roles alternate.
    // The ChatBot seeds a bot greeting, so trim any leading bot turns.
    const lastMsg = messages[messages.length - 1];
    let history = messages.slice(0, -1);
    const firstUserIdx = history.findIndex(m => m.sender === "user");
    history = firstUserIdx === -1 ? [] : history.slice(firstUserIdx);

    for (const msg of history) {
      if (msg.sender === "user") {
        mistralMessages.push({ role: "user", content: msg.text || "" });
      } else if (msg.sender === "bot") {
        mistralMessages.push({ role: "assistant", content: msg.text || "" });
      }
    }

    // Add latest user message (with optional image context)
    if (lastMsg) {
      let userContent = lastMsg.text || "";
      if (lastMsg.image) {
        // Mistral's text models can't process raw images, but we tell the model about it
        userContent += "\n\n[The student has attached an image. Please acknowledge that you see they've shared an image and provide helpful academic guidance related to what they've described.]";
      }
      mistralMessages.push({ role: "user", content: userContent });
    }

    // ── Call Mistral API ─────────────────────────────────────────────
    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: mistralMessages,
        temperature: 0.4,
        max_tokens: 1500,
      }),
    });

    if (!mistralRes.ok) {
      const errBody = await mistralRes.text();
      console.error("Mistral API error:", mistralRes.status, errBody);
      return Response.json(
        { text: `I'm having trouble connecting to my AI engine right now (error ${mistralRes.status}). Please try again in a moment.` },
        { status: 200 }
      );
    }

    const mistralData = await mistralRes.json();
    let responseText = mistralData.choices?.[0]?.message?.content || "I wasn't able to generate a response. Please try again.";

    // Strip out remaining markdown characters just in case Mistral ignores the instruction
    responseText = responseText
      .replace(/\*\*/g, '')      // Remove bold (**)
      .replace(/###/g, '')       // Remove headers (###)
      .replace(/##/g, '')        // Remove headers (##)
      .replace(/#/g, '')         // Remove headers (#)
      .replace(/__/g, '')        // Remove bold (__)
      .replace(/~~/g, '')        // Remove strikethrough (~~)
      .replace(/```[a-z]*\n/g, '') // Remove code blocks
      .replace(/```/g, '')       // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code ticks but keep content
      .replace(/^\s*-\s+/gm, '• ') // Replace markdown bullets (-) with clean dots
      .replace(/^\s*\*\s+/gm, '• '); // Replace markdown bullets (*) with clean dots

    return Response.json({ text: responseText }, { status: 200 });

  } catch (error) {
    console.error("Chat Agent Error:", error);
    return Response.json(
      { text: "The Academic Agent encountered an unexpected error. Please try again shortly." },
      { status: 200 }
    );
  }
}

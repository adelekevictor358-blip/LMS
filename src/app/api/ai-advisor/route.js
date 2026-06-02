/**
 * AI Academic Advisor — Mistral-powered endpoint
 * Receives the student's real academic snapshot and returns personalised insights.
 */

export async function POST(req) {
  try {
    const { studentProfile } = await req.json();

    const MISTRAL_KEY = process.env.MISTRAL_API_KEY;
    if (!MISTRAL_KEY) {
      return Response.json(
        { error: "Mistral API key is not configured." },
        { status: 500 }
      );
    }

    // ── Build a rich student context string ──────────────────────────
    const {
      name,
      program,
      level,
      enrolledCourses = [],
      activeAssignments = [],
      submissions = [],
      quizResults = [],
      quizzes = [],
    } = studentProfile;

    const courseList = enrolledCourses
      .map((c) => `• ${c.code} – ${c.title} (${c.units} units, ${c.semester} semester)`)
      .join("\n");

    const assignmentList = activeAssignments
      .map((a) => {
        const daysLeft = Math.ceil(
          (new Date(a.dueDate) - Date.now()) / 86400000
        );
        return `• "${a.title}" for course ${a.courseId} — due in ${daysLeft} day(s), max score ${a.maxScore}`;
      })
      .join("\n");

    const submissionSummary = submissions.length
      ? submissions
          .map(
            (s) =>
              `• Assignment #${s.assignmentId}: ${s.score !== null ? `scored ${s.score}` : "awaiting grade"}`
          )
          .join("\n")
      : "No submissions yet.";

    const quizSummary = quizResults.length
      ? quizResults
          .map((r) => {
            const quiz = quizzes.find((q) => q.id === r.quizId);
            return `• ${quiz?.title || `Quiz #${r.quizId}`}: scored ${r.score}/${quiz?.questions?.length || "?"}`;
          })
          .join("\n")
      : "No quizzes attempted yet.";

    // ── System prompt ────────────────────────────────────────────────
    const systemPrompt = `You are the Mountain Top University AI Academic Advisor.
You receive a REAL student academic snapshot and must return a JSON object with personalised, actionable insights.

RULES:
1. Analyse the data honestly — if the student has few submissions or low quiz scores, flag it constructively.
2. Generate a projected GPA trend direction ("+0.XX" or "-0.XX") based on submission completeness and quiz performance.
3. Classify engagement as "High", "Moderate", or "Low" based on how many assignments are submitted vs. total, and quiz participation.
4. Identify the single weakest course (or area) and provide a specific, encouraging recommendation.
5. Build a realistic daily study schedule (3-4 slots) prioritising the weakest area first.
6. Always keep tone supportive, scholarly, and motivating.

You MUST return ONLY valid JSON (no markdown, no code fences). Use this exact schema:
{
  "gpaTrend": "+0.15",
  "engagement": "High",
  "weakestArea": { "course": "PHY104", "title": "Practical Physics II", "reason": "...", "recommendation": "..." },
  "studySchedule": [
    { "time": "9:00 AM", "course": "PHY104", "task": "Review Module 4", "priority": true },
    { "time": "1:00 PM", "course": "ICT102", "task": "HTML Forms Practice", "priority": false }
  ],
  "motivationalNote": "A short personalised message of encouragement."
}`;

    const userPrompt = `STUDENT SNAPSHOT
─────────────────
Name: ${name}
Program: ${program}
Level: ${level}

ENROLLED COURSES (${enrolledCourses.length}):
${courseList || "None enrolled."}

ACTIVE ASSIGNMENTS (${activeAssignments.length}):
${assignmentList || "None pending."}

SUBMISSION HISTORY (${submissions.length} total):
${submissionSummary}

QUIZ PERFORMANCE:
${quizSummary}

Please analyse this student's academic position and return the JSON insight object.`;

    // ── Call Mistral ─────────────────────────────────────────────────
    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!mistralRes.ok) {
      const errBody = await mistralRes.text();
      console.error("Mistral API error:", mistralRes.status, errBody);
      return Response.json(
        { error: `Mistral returned ${mistralRes.status}` },
        { status: 502 }
      );
    }

    const mistralData = await mistralRes.json();
    const rawContent = mistralData.choices?.[0]?.message?.content;

    // Parse the JSON from Mistral's response
    let insights;
    try {
      insights = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse Mistral response as JSON:", rawContent);
      return Response.json(
        { error: "AI returned malformed data. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ insights }, { status: 200 });
  } catch (error) {
    console.error("AI Advisor Error:", error);
    return Response.json(
      { error: "An internal error occurred while generating insights." },
      { status: 500 }
    );
  }
}

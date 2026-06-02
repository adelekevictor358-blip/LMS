import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { sendEmail } from "../email";

/**
 * Initializes and executes a brilliant academic agent
 */
export async function runAcademicAgent(userMessage, history, context, imageData = null) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    modelName: "gemini-1.5-flash",
    temperature: 0.2, // Low temperature for academic accuracy
  });


  // TOOL 1: Search Course Records
  const searchCoursesTool = new DynamicStructuredTool({
    name: "search_academic_records",
    description: "Search the student's current enrollment, course details, and assignments.",
    schema: z.object({
      query: z.string().description("The topic or course to search for in the student's records"),
    }),
    func: async ({ query }) => {
      const lowerQuery = query.toLowerCase();
      const relevantCourses = context.courses.filter(c => 
        c.title.toLowerCase().includes(lowerQuery) || c.code.toLowerCase().includes(lowerQuery)
      );
      const relevantAssignments = context.assignments.filter(a => 
        a.title.toLowerCase().includes(lowerQuery)
      );
      
      return JSON.stringify({
        foundCourses: relevantCourses,
        foundAssignments: relevantAssignments,
        context: "These are the official records for the student."
      });
    },
  });

  // TOOL 2: Send Official Email Notification
  const sendEmailTool = new DynamicStructuredTool({
    name: "send_official_email",
    description: "Send an official email to the student or university staff for reminders or alerts.",
    schema: z.object({
      recipient: z.string().email().description("The email address of the recipient"),
      subject: z.string().description("The subject line of the email"),
      body: z.string().description("The HTML content of the email body"),
    }),
    func: async ({ recipient, subject, body }) => {
      const result = await sendEmail({ to: recipient, subject, html: body });
      return result.success 
        ? `Email successfully dispatched! Preview: ${result.previewUrl}`
        : `Email failure: ${result.error}`;
    },
  });

  // TOOL 3: Generate Academic Visual Aid
  const generateImageTool = new DynamicStructuredTool({
    name: "generate_visual_aid",
    description: "Generates a conceptual image or visual aid for a complex academic topic (e.g., a diagram of a cell, a physics concept, or a historical scene).",
    schema: z.object({
      prompt: z.string().description("A detailed description of the academic visual aid to generate"),
    }),
    func: async ({ prompt }) => {
      // In a real production environment, you'd use DALL-E or Imagen API
      // For this high-fidelity prototype, we use a high-quality AI image generation proxy
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;
      return `IMAGE_GENERATED: ${imageUrl}`;
    },
  });

  // TOOL 4: Summarize Academic Content
  const summarizeTool = new DynamicStructuredTool({
    name: "summarize_content",
    description: "Summarize long academic texts, lecture notes, or research findings into concise bullet points.",
    schema: z.object({
      content: z.string().description("The full text content to be summarized"),
      detailLevel: z.enum(["brief", "comprehensive"]).default("brief"),
    }),
    func: async ({ content, detailLevel }) => {
      // We use a separate internal call to Gemini for the actual summarization logic
      const summaryModel = new ChatGoogleGenerativeAI({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        modelName: "gemini-1.5-flash",
      });
      
      const res = await summaryModel.invoke([
        { role: "system", content: `Summarize the following academic material in a ${detailLevel} manner. Use clear headings and bullet points.` },
        { role: "user", content }
      ]);
      
      return res.content;
    },
  });

  // Bind tools to the model
  const tools = [searchCoursesTool, sendEmailTool, generateImageTool, summarizeTool];

  const modelWithTools = model.bindTools(tools);

  // Simple "Agent" Loop (Manual implementation for transparency in Next.js Edge/API)
  const systemPrompt = `
    You are the "Brilliant Academic Agent" of Mountain Top University. 
    You have autonomous capabilities to search student records and send official emails.
    
    STUDENT PROFILE:
    - Name: ${context.userName}
    - Program: ${context.program}
    - Level: ${context.level}
    
    INSTRUCTIONS:
    1. If a student asks about their workload, use 'search_academic_records'.
    2. If a student wants a reminder sent to themselves or a staff member, use 'send_official_email'.
    3. If a student needs a visual aid or wants to see a concept, use 'generate_visual_aid'.
    4. If a student provides a large text or asks to condense information, use 'summarize_content'.
    5. Be incredibly smart. If you see a deadline approaching, proactively suggest a study plan.
    6. Think "outside the box": If they are struggling with a course, suggest looking at specific materials or reaching out to a lecturer.
    7. Always maintain a sophisticated, scholarly tone.

  `;

  // We add the system prompt as the first message
  // Construct the message array
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(m => ({ 
      role: m.sender === 'user' ? 'user' : 'assistant', 
      content: m.text 
    })),
  ];

  // Add the last user message with optional image
  if (imageData) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userMessage || "Analyze this image." },
        {
          type: "image_url",
          image_url: imageData, // Gemini via LangChain accepts base64 data URLs here
        },
      ],
    });
  } else {
    messages.push({ role: "user", content: userMessage });
  }

  // Call model
  const response = await modelWithTools.invoke(messages);


  // Handle Tool Calls
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    const tool = tools.find(t => t.name === toolCall.name);
    
    if (tool) {
      console.log(`Agent is executing tool: ${toolCall.name}`);
      const toolResult = await tool.invoke(toolCall.args);
      
      // Get final response from model after tool execution
      const finalMsg = await model.invoke([
        ...messages,
        response,
        {
          role: "tool",
          content: toolResult,
          tool_call_id: toolCall.id,
        },
      ]);
      
      return finalMsg.content;
    }
  }

  return response.content;
}

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/chat/completions.mjs";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { model, messages } = await req.json();

    const tools = [
      {
        type: "function",
        function: {
          name: "get_github_data",
          description: "Get the github data of the user",
          parameters: {
            type: "object",
            properties: {
              github_username: { type: "string" },
            },
          },
        },
      },
    ];

    const completion = await openai.chat.completions.create({
      model,
      messages,
      tools: tools as ChatCompletionTool[],
      store: true,
    });

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("Error in /chat/completions:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

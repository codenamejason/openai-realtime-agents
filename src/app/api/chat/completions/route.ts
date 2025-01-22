import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/chat/completions.mjs";

const openai = new OpenAI();

const tools = [
  {
    type: "function",
    function: {
      name: "getGithubData",
      description: "Get the user's Github data",
      parameters: {
        type: "object",
        properties: {
          github_username: {
            type: "string",
            description: "The user's Github username",
          },
        },
      },
    },
  },
];

export async function POST(req: Request) {
  try {
    const { model, messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model,
      messages,
      tools: tools as ChatCompletionTool[],
    });

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("Error in /chat/completions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GroqService, GroqChatOptions } from "../../../services/groqService";

export async function POST(req: NextRequest) {
  try {
    const body: GroqChatOptions = await req.json();
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    if (body.jsonMode) {
      const data = await GroqService.callJson(body);
      return NextResponse.json({ result: data });
    } else {
      const text = await GroqService.callChat(body);
      return NextResponse.json({ result: text });
    }
  } catch (error: any) {
    console.error("Groq API route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request with Groq" },
      { status: 500 }
    );
  }
}

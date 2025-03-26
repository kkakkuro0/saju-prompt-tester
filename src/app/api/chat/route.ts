import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { systemPrompt, userInput } = await request.json();

    if (!systemPrompt || !userInput) {
      return NextResponse.json(
        { error: "시스템 프롬프트와 사용자 입력이 필요합니다." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("GPT API 에러:", error);
    return NextResponse.json(
      { error: "GPT API 요청 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 
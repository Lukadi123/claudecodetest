import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing title or content' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Create client inside handler so the env var is read at runtime, not build time
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Truncate content to avoid excessive token usage (roughly 12k chars ≈ 3k tokens)
    const truncatedContent = content.slice(0, 12000);

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-0-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Summarize this news article in 2–4 short sentences. Use a clear, neutral tone. No bullet points, no extra commentary. Plain text only.\n\nTitle: ${title}\n\nArticle:\n${truncatedContent}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const summary = textBlock ? textBlock.text.trim() : '';

    if (!summary) {
      return NextResponse.json(
        { error: 'Empty summary returned' },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[API/summary] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

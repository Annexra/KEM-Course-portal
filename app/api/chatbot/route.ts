import { NextResponse } from 'next/server';
import { MOCK_AI_KNOWLEDGE_BASE } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase();

    // Match query keywords
    const match = MOCK_AI_KNOWLEDGE_BASE.find((item) =>
      item.keywords.some((kw) => lowerQuery.includes(kw))
    );

    if (match) {
      return NextResponse.json({
        reply: match.reply,
        articleId: match.articleId,
      });
    }

    // Default response
    return NextResponse.json({
      reply: `Regarding "${query}": For Emergency Medicine protocol, please consult the Kauvery EM Clinical Manual. High-quality CPR, early defibrillation, and rapid airway security remain core priorities.`,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process AI query' }, { status: 500 });
  }
}

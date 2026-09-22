import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ReviewResultSchema } from '@/lib/types/review';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Kein Code übergeben' },
        { status: 400 },
      );
    }

    // 1. KI-Analyse ausführen (Structured Output)
    const { object: reviewResult } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      prompt: `Analysiere folgenden ${language || 'TypeScript'}-Code:\n\n\`\`\`\n${code}\n\`\`\``,
      schema: ReviewResultSchema,
    });

    // 2. In Supabase speichern
    const { data: savedReview, error: dbError } = await supabase
      .from('reviews')
      .insert({
        language: language || 'typescript',
        original_code: code,
        fixed_code: reviewResult.fixedCode,
        score: reviewResult.score,
        issues: reviewResult.issues,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Supabase Error:', dbError);
    }

    // 3. Ergebnis an Frontend senden
    return NextResponse.json({
      id: savedReview?.id || null,
      ...reviewResult,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Code-Analyse' },
      { status: 500 },
    );
  }
}

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type TransformKind = 'translate' | 'improve' | 'compliance';

export type TransformRequest = {
  kind: TransformKind;
  sourceLocale?: string;
  targetLocales?: string[];
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  glossary?: Record<string, string>;
  complianceRules?: {
    banned?: string[];
    replacements?: Record<string, string>;
    notes?: string[];
  };
};

export type TransformResult = {
  byLocale?: Record<string, { content: string; seoTitle?: string; seoDescription?: string }>;
  content?: string;
};

function buildSystemPrompt(kind: TransformKind): string {
  if (kind === 'translate') {
    return 'You are a senior multilingual editor. Translate preserving structure (headings, lists, tables), keep markdown. Use glossary if provided. Keep SEO title/description concise.';
  }
  if (kind === 'improve') {
    return 'You are an expert copy editor for AEO. Improve clarity, add answer-first phrasing (1-3 sentences), keep markdown structure, do not invent facts. Keep SEO concise.';
  }
  return 'You are a compliance editor. Sanitize banned terms for specific platforms. Replace or remove prohibited words, keep meaning neutral, avoid direct mentions of cannabis and related terms.';
}

export async function runTransform(req: TransformRequest): Promise<TransformResult> {
  const system = buildSystemPrompt(req.kind);

  // Build user message
  const userPayload = {
    kind: req.kind,
    sourceLocale: req.sourceLocale,
    targetLocales: req.targetLocales,
    seoTitle: req.seoTitle,
    seoDescription: req.seoDescription,
    glossary: req.glossary,
    complianceRules: req.complianceRules,
    content: req.content,
  };

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify(userPayload) }
    ]
  });

  const text = completion.choices[0]?.message?.content || '';

  // Simple convention: if targetLocales provided, expect JSON per-locale; else plain content
  try {
    const parsed = JSON.parse(text) as TransformResult;
    return parsed;
  } catch {
    return { content: text };
  }
}



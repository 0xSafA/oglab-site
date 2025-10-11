export function jsonLdArticle(params: { headline: string; author?: string; datePublished?: string; description?: string; url?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    author: params.author ? { '@type': 'Person', name: params.author } : undefined,
    datePublished: params.datePublished,
    description: params.description,
    mainEntityOfPage: params.url,
  };
}

export function jsonLdFAQ(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } }))
  };
}

export function jsonLdQAPage(params: { question: string; answers: Array<{ text: string; upvoteCount?: number; dateCreated?: string }> }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: params.question,
      acceptedAnswer: params.answers[0] ? { '@type': 'Answer', text: params.answers[0].text } : undefined,
      suggestedAnswer: params.answers.slice(1).map(a => ({ '@type': 'Answer', text: a.text, upvoteCount: a.upvoteCount, dateCreated: a.dateCreated }))
    }
  };
}



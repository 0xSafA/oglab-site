export function robotsFromNoindex(noindex?: boolean) {
  return {
    index: !noindex,
    follow: !noindex,
  } as const;
}

export function alternatesFromTranslations(baseUrl: string, items: Array<{ locale: string; slug: string }>) {
  const languages: Record<string, string> = {};
  for (const t of items) {
    languages[t.locale] = `${baseUrl}/${t.locale}/blog/${t.slug}`;
  }
  return { languages } as const;
}



'use client';

type Fields = {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  body: string;
};

type Props = {
  locale: string;
  value: Fields;
  onChange: (value: Fields) => void;
};

export function CmsLocaleEditor({ locale, value, onChange }: Props) {
  const { title, slug, seoTitle, seoDescription, body } = value;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm">Title ({locale})</label>
        <input className="border rounded px-3 py-2 w-full" value={title} onChange={(e)=>onChange({ ...value, title: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Slug</label>
          <input className="border rounded px-3 py-2 w-full" value={slug} onChange={(e)=>onChange({ ...value, slug: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm">SEO Title</label>
          <input className="border rounded px-3 py-2 w-full" value={seoTitle} onChange={(e)=>onChange({ ...value, seoTitle: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm">SEO Description</label>
        <textarea className="border rounded px-3 py-2 w-full" rows={3} value={seoDescription} onChange={(e)=>onChange({ ...value, seoDescription: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm">Content (Markdown)</label>
        <textarea className="border rounded px-3 py-2 w-full h-64" value={body} onChange={(e)=>onChange({ ...value, body: e.target.value })} />
      </div>
      <div className="border rounded p-3">
        <div className="text-sm font-semibold mb-2">JSON-LD Preview</div>
        <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  inLanguage: locale,
  description: seoDescription
}, null, 2)}
        </pre>
      </div>
    </div>
  );
}



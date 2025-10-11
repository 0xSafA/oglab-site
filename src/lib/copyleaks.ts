export async function copyleaksLogin(email: string, apiKey: string): Promise<string> {
  const res = await fetch('https://id.copyleaks.com/v3/account/login/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, key: apiKey })
  });
  if (!res.ok) throw new Error('Copyleaks login failed');
  const data = await res.json();
  return data?.access_token;
}

export async function submitTextScan(params: {
  token: string;
  text: string;
  sandbox?: boolean;
  submitId: string; // an id client provides for tracking
  webhookUrl?: string;
  language?: string;
}) {
  const { token, text, sandbox = false, submitId, webhookUrl, language } = params;
  const url = `https://api.copyleaks.com/v3/scans/submit/text/${encodeURIComponent(submitId)}${sandbox ? '?sandbox=true' : ''}`;
  const body = {
    base64: Buffer.from(text, 'utf8').toString('base64'),
    properties: {
      webhooks: webhookUrl ? { status: webhookUrl } : undefined,
      includeHtml: false,
      eula: true,
      sensitivityLevel: 1,
      language
    }
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Copyleaks submit failed');
  return true;
}



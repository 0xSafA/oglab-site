import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Supported locales
  const supportedLocales = ['en', 'ru', 'th', 'fr', 'de', 'he', 'it'];
  let detectedLocale = 'en'; // default
  
  // Simple locale detection from Accept-Language header
  // Check each supported locale in priority order
  for (const locale of supportedLocales) {
    if (acceptLanguage.toLowerCase().includes(locale)) {
      detectedLocale = locale;
      break;
    }
  }
  
  // Redirect to detected locale
  redirect(`/${detectedLocale}`);
}


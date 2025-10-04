import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
 
export const locales = ['en', 'ru', 'th', 'fr', 'de', 'he', 'it'] as const;
 
export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always' // Always show locale prefix
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);


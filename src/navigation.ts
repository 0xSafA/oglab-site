import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
 
export const locales = ['en', 'ru', 'th', 'fr', 'de', 'he', 'it'] as const;
export const localePrefix = 'always'; // always show locale prefix
 
export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);


import { SearchParamOptions } from '@/types';

export function formatSearchParams(params: Partial<SearchParamOptions>) {
    return Object.entries(params)
        .filter(([, value]) => Boolean(value))
        .map(([k, v]) =>
            ['type', 'categories', 'tags', 'author', 'manufacturer','shops'].includes(k)
                ? `${k}.slug:${v}`
                : `${k}:${v}`
        )
        .join(';');
}
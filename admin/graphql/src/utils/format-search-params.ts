interface SearchParamOptions {
  categories: string;
  code: string;
  type: string;
  name: string;
  shop_id: string;
  is_approved: boolean;
  tracking_number: string;
  status: string;
  title: string;
  target: string;
  notify_type: string;
  product_type: string;
  shops: string;
  refund_reason: string;
  author: string;
  manufacturer: string;
}

function formatBooleanSearchParam(key: string, value: boolean) {
  return value ? `${key}:1` : `${key}:`;
}

export function formatSearchParams(params: Partial<SearchParamOptions>) {
  return Object.entries(params)
    .filter(([, value]) => Boolean(value))
    .map(([k, v]) =>
      [
        'type',
        'categories',
        'tags',
        'author',
        'manufacturer',
        'shops',
        'refund_reason',
      ].includes(k)
        ? `${k}.slug:${v}`
        : ['is_approved'].includes(k)
        ? formatBooleanSearchParam(k, v as boolean)
        : `${k}:${v}`,
    )
    .join(';');
}

import camelCaseKeys from 'camelcase-keys';
interface Paginator {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
  data?: any[];
}
export const mapPaginatorData = (obj: Paginator | undefined) => {
  if (!obj) return null;
  const {
    //@ts-ignore
    data,
    ...formattedValues
  } = camelCaseKeys(
    //@ts-ignore
    obj,
  );
  return {
    ...formattedValues,
    //@ts-ignore
    hasMorePages: formattedValues.lastPage !== formattedValues.currentPage,
    //@ts-ignore
    firstItem: formattedValues.from,
    //@ts-ignore
    lastItem: formattedValues.to,
  };
};

import { useMemo } from 'react';

interface ReverseProps {
  items: {
    [key: string]: any;
  }[];
}

export const useReverse = ({ items }: ReverseProps) => {
  const reverse = useMemo(() => {
    return items && items?.length > 1
      ? items?.map(items?.pop, [...items])
      : items;
  }, [items]);

  return reverse;
};

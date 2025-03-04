import Label from '@/components/ui/label';
import Select from '@/components/ui/select/select';
import { useCategoriesQuery } from '@/graphql/categories.graphql';
import { useTypesQuery } from '@/graphql/type.graphql';
import {
  QueryCategoriesHasTypeColumn,
  SqlOperator,
  ProductType,
} from '__generated__/__types__';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ActionMeta } from 'react-select';
import { useAuthorsQuery } from '@/graphql/authors.graphql';

type Props = {
  onCategoryFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  onTypeFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  onAuthorFilter?: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
  onProductTypeFilter?: (
    newValue: any,
    actionMeta: ActionMeta<unknown>
  ) => void;
  className?: string;
  type?: string;
  enableType?: boolean;
  enableCategory?: boolean;
  enableAuthor?: boolean;
  enableProductType?: boolean;
};

export default function CategoryTypeFilter({
  onTypeFilter,
  onCategoryFilter,
  onAuthorFilter,
  onProductTypeFilter,
  className,
  type,
  enableType,
  enableCategory,
  enableAuthor,
  enableProductType,
}: Props) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { data, loading } = useTypesQuery({
    variables: {
      language: locale,
    },
    fetchPolicy: 'network-only',
  });
  const {
    data: categoryData,
    loading: categoryLoading,
    refetch: categoryRefetch,
  } = useCategoriesQuery({
    variables: {
      language: locale,
      first: 999,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  const { data: authorsData, loading: authorLoading } = useAuthorsQuery({
    fetchPolicy: 'network-only',
    variables: {
      language: locale,
      first: 1000,
      is_approved: true,
    },
  });

  useEffect(() => {
    let hasTypeCondition = null;
    if (Boolean(type)) {
      hasTypeCondition = {
        column: QueryCategoriesHasTypeColumn.Slug,
        operator: SqlOperator.Eq,
        value: type,
      };
    }
    categoryRefetch({
      language: locale,
      first: 999,
      hasType: hasTypeCondition,
      page: 1,
    });
  }, [type]);

  const productType = [
    { name: 'Simple product', slug: ProductType.Simple },
    { name: 'Variable product', slug: ProductType.Variable },
  ];

  return (
    <div
      className={cn(
        'flex w-full flex-col space-y-5 rtl:space-x-reverse md:flex-row md:items-end md:space-x-5 md:space-y-0',
        className
      )}
    >
      {enableType ? (
        <div className="w-full">
          <Label>{t('common:filter-by-group')}</Label>
          <Select
            options={data?.types}
            isLoading={loading}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.slug}
            placeholder={t('common:filter-by-group-placeholder')}
            onChange={onTypeFilter}
            isClearable={true}
          />
        </div>
      ) : (
        ''
      )}

      {enableCategory ? (
        <div className="w-full">
          <Label>{t('common:filter-by-category')}</Label>
          <Select
            options={categoryData?.categories?.data}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.slug}
            placeholder={t('common:filter-by-category-placeholder')}
            isLoading={categoryLoading}
            onChange={onCategoryFilter}
            isClearable={true}
          />
        </div>
      ) : (
        ''
      )}

      {enableAuthor ? (
        <div className="w-full">
          <Label>{t('common:filter-by-author')}</Label>
          <Select
            options={authorsData?.authors?.data}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.slug}
            placeholder={t('common:filter-by-author-placeholder')}
            isLoading={authorLoading}
            onChange={onAuthorFilter}
            isClearable={true}
          />
        </div>
      ) : (
        ''
      )}

      {enableProductType ? (
        <div className="w-full">
          <Label>Filter by Product Type</Label>
          <Select
            options={productType}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.slug}
            placeholder="Filter by product type"
            onChange={onProductTypeFilter}
            isClearable={true}
          />
        </div>
      ) : (
        ''
      )}
    </div>
  );
}

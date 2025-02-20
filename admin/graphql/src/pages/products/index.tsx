import Card from '@/components/common/card';
import Search from '@/components/common/search';
import { ArrowDown } from '@/components/icons/arrow-down';
import { ArrowUp } from '@/components/icons/arrow-up';
import Layout from '@/components/layouts/admin';
import CategoryTypeFilter from '@/components/filters/category-type-filter';
import ProductList from '@/components/product/product-list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useProductsQuery } from '@/graphql/products.graphql';
import { adminOnly } from '@/utils/auth-utils';
import {
  Category,
  ProductPaginator,
  SortOrder,
  Type,
} from '__generated__/__types__';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
// import QuantitySortFilter from '@/components/product/quantity-sort-filter';
import { QueryProductsOrderByColumn } from '@/types/custom-types';
import { formatSearchParams } from '@/utils/format-search-params';
import { useRouter } from 'next/router';
import PageHeading from '@/components/common/page-heading';
import { ProductTypeOptions } from '@/types/custom-types';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(true);
  const [productType, setProductType] = useState('');
  const { locale } = useRouter();
  const toggleVisible = () => {
    setVisible((v) => !v);
  };

  const { data, loading, error, refetch } = useProductsQuery({
    variables: {
      language: locale,
      first: 10,
      orderBy: QueryProductsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!loading) {
      refetch({
        search: formatSearchParams({
          name: searchTerm,
          type,
          categories: category,
          product_type: productType,
        }),
        page,
      });
    }
  }, [type, searchTerm, category, page, productType]);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading title={t('form:input-label-products')} />
          </div>

          <div className="flex w-full flex-col items-center ms-auto md:w-2/4">
            <Search
              onSearch={handleSearch}
              placeholderText={t('form:input-placeholder-search-name')}
            />
          </div>

          <button
            className="mt-5 flex items-center whitespace-nowrap text-base font-semibold text-accent md:mt-0 md:ms-5"
            onClick={toggleVisible}
          >
            {t('common:text-filter')}{' '}
            {visible ? (
              <ArrowUp className="ms-2" />
            ) : (
              <ArrowDown className="ms-2" />
            )}
          </button>
        </div>

        <div
          className={cn('flex w-full transition', {
            'visible h-auto': visible,
            'invisible h-0': !visible,
          })}
        >
          <div className="mt-5 flex w-full flex-col border-t border-gray-200 pt-5 md:mt-8 md:flex-row md:items-center md:pt-8">
            <CategoryTypeFilter
              className="w-full"
              type={type}
              onCategoryFilter={(category: Category) => {
                setCategory(category?.slug!);
                setPage(1);
              }}
              onTypeFilter={(type: Type) => {
                setType(type?.slug!);
                setPage(1);
              }}
              onProductTypeFilter={(productType: ProductTypeOptions) => {
                setProductType(productType?.slug!);
                setPage(1);
              }}
              enableCategory
              enableType
              enableProductType
            />
          </div>
        </div>
      </Card>
      <ProductList
        products={data?.products as ProductPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
ProductsPage.authenticate = {
  permissions: adminOnly,
};
ProductsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

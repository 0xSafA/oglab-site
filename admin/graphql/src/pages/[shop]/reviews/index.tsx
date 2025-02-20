import ReviewList from '@/components/reviews/review-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useReviewsQuery } from '@/graphql/reviews.graphql';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import {
  QueryReviewsOrderByColumn,
  ReviewPaginator,
  SortOrder,
} from '__generated__/__types__';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';

export default function Reviews() {
  // const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { shop },
  } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: { slug: shop as string },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error, refetch } = useReviewsQuery({
    variables: {
      first: 15,
      shop_id: shopId,
      orderBy: [
        {
          column: QueryReviewsOrderByColumn.CreatedAt,
          order: SortOrder.Desc,
        },
      ],
      page: 1,
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    // setPage(current);
    refetch({
      page: current,
    });
  }
  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/3">
          <PageHeading title={t('form:input-label-reviews')} />
        </div>
      </Card>
      <ReviewList
        reviews={data?.reviews as ReviewPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
Reviews.authenticate = {
  permissions: adminAndOwnerOnly,
};
Reviews.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

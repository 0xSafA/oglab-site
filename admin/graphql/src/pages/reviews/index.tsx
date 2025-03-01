import ReviewList from '@/components/reviews/review-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReviewsQuery } from '@/graphql/reviews.graphql';
import {
  QueryReviewsOrderByColumn,
  ReviewPaginator,
  SortOrder,
} from '__generated__/__types__';
import PageHeading from '@/components/common/page-heading';

export default function Reviews() {
  // const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useReviewsQuery({
    variables: {
      first: 15,
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

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="md:w-1/4">
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
Reviews.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});

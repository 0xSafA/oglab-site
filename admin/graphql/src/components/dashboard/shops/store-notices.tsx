import ErrorMessage from '@/components/ui/error-message';
import { useTranslation } from 'next-i18next';
import { useStoreNoticesQuery } from '@/graphql/store-notice.graphql';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import StoreNoticeCard from '@/components/store-notice/store-notice-card';
import Button from '@/components/ui/button';
import NotFound from '@/components/ui/not-found';
import { LIMIT } from '@/utils/constants';
import { SortOrder } from '__generated__/__types__';

const useStoreNoticesLoadMoreQuery = () => {
  const { locale } = useRouter();

  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useStoreNoticesQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: 'effective_from',
      sortedBy: SortOrder?.Desc,
      page: 1,
    },
    notifyOnNetworkStatusChange: true,
  });

  function handleLoadMore() {
    if (data?.storeNotices?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.storeNotices?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }

  return {
    storeNotices: data?.storeNotices?.data ?? [],
    paginatorInfo: data?.storeNotices?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasNextPage: Boolean(data?.storeNotices?.paginatorInfo?.hasMorePages),
  };
};

function StoreNotices() {
  const { t } = useTranslation();
  const {
    storeNotices,
    loadMore,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
  } = useStoreNoticesLoadMoreQuery();

  if (!isLoading && !storeNotices?.length)
    return (
      <div className="flex h-full w-full items-center justify-center px-4 pt-6 pb-8 lg:p-8">
        <NotFound
          image="/no-store-notice.svg"
          text="text-notice-not-found"
          className="w-1/3"
        />
      </div>
    );
  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <>
      <h2 className="mb-7 border-b border-b-[#E5E5E5] pb-[1.625rem] text-2xl font-semibold leading-none text-muted-black">
        {t('sidebar-nav-item-store-notice')}
      </h2>
      <div className="space-y-4 md:space-y-7">
        {storeNotices?.map((notice: any, idx: number) => (
          <StoreNoticeCard noticeData={notice} key={idx} />
        ))}
      </div>
      {hasNextPage && (
        <div className="mt-8 grid place-content-center md:mt-10">
          <Button onClick={loadMore} loading={isLoadingMore}>
            {t('common:text-load-more')}
          </Button>
        </div>
      )}
    </>
  );
}

export default StoreNotices;

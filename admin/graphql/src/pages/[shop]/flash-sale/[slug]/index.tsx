import SingleView from '@/components/flash-sale/single-view';
import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useFlashSaleQuery } from '@/graphql/flash_sale.graphql';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { FlashSale } from '__generated__/__types__';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const VendorFlashSaleSinglePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();

  const { data, loading, error } = useFlashSaleQuery({
    variables: {
      slug: query?.slug as string,
      language: locale as string,
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <SingleView data={data?.flashSale as FlashSale} />
    </>
  );
};

VendorFlashSaleSinglePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
VendorFlashSaleSinglePage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default VendorFlashSaleSinglePage;

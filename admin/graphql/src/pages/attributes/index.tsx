import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import AttributeList from '@/components/attribute/attribute-list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useAttributesQuery } from '@/graphql/attributes.graphql';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { Attribute } from '__generated__/__types__';
import PageHeading from '@/components/common/page-heading';

export default function AttributePage() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { data, loading, error, refetch } = useAttributesQuery({
    variables: {
      language: locale,
    },
    fetchPolicy: 'network-only',
  });
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="md:w-1/4">
          <PageHeading title={t('common:sidebar-nav-item-attributes')} />
        </div>
      </Card>

      <AttributeList
        attributes={data?.attributes as Attribute[]}
        refetch={refetch}
      />
    </>
  );
}

AttributePage.authenticate = {
  permissions: adminOnly,
};
AttributePage.Layout = Layout;
export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

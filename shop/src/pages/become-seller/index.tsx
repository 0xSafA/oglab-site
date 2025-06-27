import { BecomeSeller } from '@/components/become-seller';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import Seo from '@/components/seo/seo';
import { Routes } from '@/config/routes';
import { getStaticProps } from '@/framework/become-seller';
import { NextPageWithLayout } from '@/types';
import { InferGetStaticPropsType } from 'next';
export { getStaticProps };

const BecomeSellerPage: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ data }) => {
  return (
    <div className="bg-[#F9FAFB]">
      <Seo title="Become seller" url={Routes.becomeSeller} />
      <BecomeSeller data={data} />
    </div>
  );
};

BecomeSellerPage.getLayout = getLayoutWithFooter;

export default BecomeSellerPage;

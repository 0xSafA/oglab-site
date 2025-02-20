import Seo from '@/components/seo/seo';
import DashboardLayout from '@/layouts/_dashboard';
import MyCards from '@/components/card/my-cards';
import Card from '@/components/ui/cards/card';
import { useSettings } from '@/framework/settings';
import { PaymentGateway } from '@/types';
import { isStripeAvailable } from '@/lib/is-stripe-available';
import { FeatureNotAvailable } from '@/components/common/feature-not-available';

export { getStaticProps } from '@/framework/general.ssr';

const MyCardsPage = () => {
  const { settings } = useSettings();

  // validation check from front-end
  const isStripeGatewayAvailable = isStripeAvailable(settings);
  if (!isStripeGatewayAvailable) {
    return (
      <Card className="w-full shadow-none sm:shadow flex flex-col">
        <div className="m-auto">
          <FeatureNotAvailable />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Seo noindex={true} nofollow={true} />
      <Card className="shadow-n relative w-full self-stretch overflow-hidden md:p-16 md:pt-12">
        <MyCards />
      </Card>
    </>
  );
};

MyCardsPage.authenticationRequired = true;

MyCardsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default MyCardsPage;

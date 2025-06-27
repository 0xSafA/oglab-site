import { useTranslation } from 'next-i18next';
import {
  billingAddressAtom,
  clearCheckoutAtom,
  shippingAddressAtom,
} from '@/store/checkout';
import dynamic from 'next/dynamic';
import { getLayout } from '@/components/layouts/layout';
import { AddressType } from '@/framework/utils/constants';
import Seo from '@/components/seo/seo';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import GuestName from '@/components/checkout/guest-name';
import { useSettings } from '@/framework/settings';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import OrderNote from '@/components/checkout/order-note';

export { getStaticProps } from '@/framework/general.ssr';

const ScheduleGrid = dynamic(
  () => import('@/components/checkout/schedule/schedule-grid')
);
const GuestAddressGrid = dynamic(
  () => import('@/components/checkout/address-grid-guest')
);
const ContactGrid = dynamic(
  () => import('@/components/checkout/contact/contact-grid')
);
const RightSideView = dynamic(
  () => import('@/components/checkout/right-side-view'),
  { ssr: false }
);

export default function GuestCheckoutPage() {
  // const { me } = useUser();
  const { t } = useTranslation();
  const [, resetCheckout] = useAtom(clearCheckoutAtom);
  const [billingAddress] = useAtom(billingAddressAtom);
  const [shippingAddress] = useAtom(shippingAddressAtom);
  const router = useRouter();
  const { settings, isLoading } = useSettings();
  const guestCheckout = settings?.guestCheckout;
  useEffect(() => {
    //@ts-ignore
    resetCheckout();
    if(!isLoading && !guestCheckout ) {
     router.replace(Routes.home);
    }
  }, [resetCheckout, settings]);

  if (isLoading) {
    return <Spinner showText={false} />;
  }


  return guestCheckout && (
    <>
      <Seo noindex={true} nofollow={true} />
      <div className="bg-gray-100 px-4 py-8 lg:py-10 lg:px-8 xl:py-14 xl:px-16 2xl:px-20">
        <div className="m-auto flex w-full max-w-5xl flex-col items-center rtl:space-x-reverse lg:flex-row lg:items-start lg:space-x-8">
          <div className="w-full space-y-6 lg:max-w-2xl">
            <ContactGrid
              className="bg-light p-5 shadow-700 md:p-8"
              contact={null}
              label={t('text-contact-number')}
              count={1}
            />
            <GuestName label={t('Name')} count={2} />
            <GuestAddressGrid
              className="bg-light p-5 shadow-700 md:p-8"
              label={t('text-billing-address')}
              count={3}
              addresses={billingAddress ? [billingAddress] : []}
              //@ts-ignore
              atom={billingAddressAtom}
              type={AddressType.Billing}
            />
            <GuestAddressGrid
              className="bg-light p-5 shadow-700 md:p-8"
              label={t('text-shipping-address')}
              count={4}
              addresses={shippingAddress ? [shippingAddress] : []}
              //@ts-ignore
              atom={shippingAddressAtom}
              type={AddressType.Shipping}
            />
            <ScheduleGrid
              className="bg-light p-5 shadow-700 md:p-8"
              label={t('text-delivery-schedule')}
              count={5}
            />
            <OrderNote count={6} label={t('Order Note')} />
          </div>
          <div className="mt-10 mb-10 w-full sm:mb-12 lg:mb-0 lg:w-96">
            <RightSideView />
          </div>
        </div>
      </div>
    </>
  );
}
GuestCheckoutPage.getLayout = getLayout;

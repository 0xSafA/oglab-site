import { useTranslation } from 'next-i18next';
import { Image } from '@/components/ui/image';
import contactIllustration from '@/assets/contact-illustration.svg';
import { formatAddress } from '@/lib/format-address';
import { getIcon } from '@/lib/get-icon';
import isEmpty from 'lodash/isEmpty';
import * as socialIcons from '@/components/icons/social';
import Seo from '@/components/seo/seo';
import { useRouter } from 'next/router';
import { useShop } from '@/framework/shop';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import VendorContactForm from '@/components/settings/vendor-contact-form';
import { UserAddress } from '@/types';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import Spinner from '@/components/ui/loaders/spinner/spinner';

export default function VendorContactPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const {
    query: { slug },
  } = router;
  const { data: shopData, isLoading } = useShop({ slug: slug as string });

  if (isLoading) {
    return <Spinner showText={false} />;
  }

  return (
    <>
      <Seo title={'Contact'} url={'contact'} />
      <div className="w-full bg-gray-100">
        <div className="flex flex-col w-full px-5 py-10 pb-20 mx-auto max-w-7xl md:flex-row md:pb-10 xl:py-14 xl:px-8 xl:pb-14 2xl:px-14">
          {/* sidebar */}
          <div className="order-2 w-full p-5 rounded-lg shrink-0 bg-light md:order-1 md:w-72 lg:w-96">
            <div className="flex items-center justify-center w-full mb-8 overflow-hidden">
              <Image
                src={contactIllustration}
                alt={t('nav-menu-contact')}
                className="w-full h-auto"
              />
            </div>

            <div className="flex flex-col mb-8">
              <span className="mb-3 font-semibold text-heading">
                {t('text-address')}
              </span>
              <span className="text-sm text-body">
                {!isEmpty(formatAddress(shopData?.address! as UserAddress)) ? (
                  <Link
                    title={formatAddress(shopData?.address as UserAddress)}
                    href={`https://www.google.com/maps/place/${formatAddress(
                      shopData?.address as UserAddress,
                    )}`}
                    target="_blank"
                  >
                    {formatAddress(shopData?.address as UserAddress)}
                  </Link>
                ) : (
                  t('common:text-no-address')
                )}
              </span>
            </div>

            <div className="flex flex-col mb-8">
              <span className="mb-3 font-semibold text-heading">
                {t('text-phone')}
              </span>
              <span className="text-sm text-body">
                {shopData?.settings?.contact
                  ? shopData?.settings?.contact
                  : t('text-no-contact')}
              </span>
            </div>
            {shopData?.settings?.website && (
              <div className="flex flex-col mb-8">
                <span className="mb-3 font-semibold text-heading">
                  {t('text-website')}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-body">
                    {shopData?.settings?.website}
                  </span>
                  <Link
                    href={shopData?.settings?.website ?? Routes?.home}
                    target="_blank"
                    // rel="noreferrer"
                    className="text-sm font-semibold text-accent hover:text-accent-hover focus:text-blue-500 focus:outline-none"
                  >
                    {t('text-visit-site')}
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-col mb-8">
              <span className="mb-4 font-semibold text-heading">
                {t('text-follow-us')}
              </span>
              <div className="flex items-center justify-start">
                {shopData?.settings?.socials?.map((item: any, index: number) =>
                  item?.url ? (
                    <Link
                      key={index}
                      href={item?.url}
                      title={item?.url}
                      target="_blank"
                      // rel="noreferrer"
                      className={`text-muted transition-colors duration-300 focus:outline-none ltr:mr-8 ltr:last:mr-0 rtl:ml-8 rtl:last:ml-0 hover:${item.hoverClass}`}
                    >
                      {getIcon({
                        iconList: socialIcons,
                        iconName: item?.icon,
                        className: 'w-4 h-4',
                      })}
                    </Link>
                  ) : (
                    ''
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="order-1 w-full p-5 mb-8 rounded-lg bg-light md:order-2 md:mb-0 md:p-8 ltr:md:ml-7 rtl:md:mr-7 ltr:lg:ml-9 rtl:lg:mr-9">
            <h1 className="mb-2.5 font-body text-xl font-bold text-heading md:text-2xl">
              {t('text-vendor-comments')}
            </h1>
            <VendorContactForm shop={shopData} />
          </div>
        </div>
      </div>
    </>
  );
}

VendorContactPage.getLayout = getLayoutWithFooter;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'faq'])),
  },
});

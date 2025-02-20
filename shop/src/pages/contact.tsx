import { useTranslation } from 'next-i18next';
import SuperAdminContactForm from '@/components/settings/super-admin-contact-form';
import { Image } from '@/components/ui/image';
import contactIllustration from '@/assets/contact-illustration.svg';
import { getLayout } from '@/components/layouts/layout';
// import { formatAddress } from '@/lib/format-address';
import { getIcon } from '@/lib/get-icon';
// import isEmpty from 'lodash/isEmpty';
import * as socialIcons from '@/components/icons/social';
import Seo from '@/components/seo/seo';
import { Routes } from '@/config/routes';
import { useSettings } from '@/framework/settings';
import Link from '@/components/ui/link';
import { isObject } from 'lodash';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
export { getStaticProps } from '@/framework/general.ssr';

export const ContactPage = () => {
  const { t } = useTranslation('common');
  const { settings }: any = useSettings();

  return (
    <>
      <Seo title={'Contact'} url={'contact'} />
      <div className="w-full bg-gray-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-5 py-10 pb-20 md:flex-row md:pb-10 xl:py-14 xl:px-8 xl:pb-14 2xl:px-14">
          {/* sidebar */}
          <div className="order-2 w-full shrink-0 rounded-lg bg-light p-5 md:order-1 md:w-72 lg:w-96">
            <div className="mb-8 flex w-full items-center justify-center overflow-hidden">
              <Image
                src={contactIllustration}
                alt={t('nav-menu-contact')}
                className="h-auto w-full"
              />
            </div>

            <div className="mb-8 flex flex-col">
              <span className="mb-3 font-semibold text-heading">
                {t('text-address')}
              </span>
              <span className="text-sm text-body">
                {settings?.contactDetails?.location?.formattedAddress ? (
                  <Link
                    title={settings?.contactDetails?.location?.formattedAddress}
                    target="_blank"
                    href={`https://www.google.com/maps/place/${settings?.contactDetails?.location?.formattedAddress}`}
                  >
                    {settings?.contactDetails?.location?.formattedAddress}
                  </Link>
                ) : (
                  t('common:text-no-address')
                )}
              </span>
            </div>

            <div className="mb-8 flex flex-col">
              <span className="mb-3 font-semibold text-heading">
                {t('text-phone')}
              </span>
              <span className="text-sm text-body">
                {settings?.contactDetails?.contact
                  ? settings?.contactDetails?.contact
                  : t('text-no-contact')}
              </span>
            </div>

            <div className="mb-8 flex flex-col">
              <span className="mb-3 font-semibold text-heading">
                Email Address
              </span>
              <span className="text-sm text-body">
                {settings?.contactDetails?.emailAddress
                  ? settings?.contactDetails?.emailAddress
                  : 'No Email Address'}
              </span>
            </div>
            {settings?.contactDetails?.website && (
              <div className="mb-8 flex flex-col">
                <span className="mb-3 font-semibold text-heading">
                  {t('text-website')}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-body">
                    {settings?.contactDetails?.website}
                  </span>
                  <Link
                    href={settings?.contactDetails?.website ?? Routes?.home}
                    target="_blank"
                    // rel="noreferrer"
                    className="text-sm font-semibold text-accent hover:text-accent-hover focus:text-blue-500 focus:outline-none"
                  >
                    {t('text-visit-site')}
                  </Link>
                </div>
              </div>
            )}

            <div className="mb-8 flex flex-col">
              <span className="mb-4 font-semibold text-heading">
                {t('text-follow-us')}
              </span>
              <div className="flex items-center justify-start">
                {settings?.contactDetails?.socials?.map(
                  (item: any, index: number) =>
                    item?.url ? (
                      <Link
                        key={index}
                        href={item?.url}
                        target="_blank"
                        title={item?.url}
                        // rel="noreferrer"
                        className={`text-muted transition-colors duration-300 focus:outline-none ltr:mr-8 ltr:last:mr-0 rtl:ml-8 rtl:last:ml-0 hover:${item.hoverClass}`}
                      >
                        {getIcon({
                          iconList: socialIcons,
                          iconName: isObject(item?.icon)
                            ? item?.icon?.value
                            : item?.icon,
                          className: 'w-4 h-4',
                        })}
                      </Link>
                    ) : (
                      ''
                    )
                )}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="order-1 mb-8 w-full rounded-lg bg-light p-5 md:order-2 md:mb-0 md:p-8 ltr:md:ml-7 rtl:md:mr-7 ltr:lg:ml-9 rtl:lg:mr-9">
            <h1 className="mb-7 font-body text-xl font-bold text-heading md:text-2xl">
              {t('text-questions-comments')}
            </h1>
            <SuperAdminContactForm />
          </div>
        </div>
      </div>
    </>
  );
};
ContactPage.getLayout = getLayoutWithFooter;
export default ContactPage;

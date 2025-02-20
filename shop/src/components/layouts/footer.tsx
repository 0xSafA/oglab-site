import { useTranslation } from 'next-i18next';
import { siteSettings } from '@/config/site';
import Link from '@/components/ui/link';
import Logo from '@/components/ui/logo';
import SubscriptionWidget from '@/components/settings/subscribe-to-newsletter';
import { useSettings } from '@/framework/settings';
import { useRouter } from 'next/router';
import { StripeIcon } from '@/components/icons/payment-gateways/stripe';
import { PayPalIcon } from '@/components/icons/payment-gateways/paypal';
import { MollieIcon } from '@/components/icons/payment-gateways/mollie';
import { RazorPayIcon } from '@/components/icons/payment-gateways/razorpay';
import { SSLComerz } from '@/components/icons/payment-gateways/sslcomerz';
import { PayStack } from '@/components/icons/payment-gateways/paystack';
import { IyzicoIcon } from '@/components/icons/payment-gateways/iyzico';
import { XenditIcon } from '@/components/icons/payment-gateways/xendit';
import { BkashIcon } from '@/components/icons/payment-gateways/bkash';
import { PaymongoIcon } from '@/components/icons/payment-gateways/paymongo';
import { FlutterwaveIcon } from '@/components/icons/payment-gateways/flutterwave';
import { isEmpty } from 'lodash';
import { SVGLoaderIcon } from '@/components/icons/svg-loader';
import { Routes } from '@/config/routes';
import { getIcon } from '@/lib/get-icon';
import * as socialIcons from '@/components/icons/social';

export const icon: any = {
  stripe: <StripeIcon />,
  paypal: <PayPalIcon />,
  razorpay: <RazorPayIcon />,
  mollie: <MollieIcon />,
  sslcommerz: <SSLComerz />,
  paystack: <PayStack />,
  iyzico: <IyzicoIcon />,
  xendit: <XenditIcon />,
  bkash: <BkashIcon />,
  paymongo: <PaymongoIcon />,
  flutterwave: <FlutterwaveIcon />,
};

const Footer = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const { settings, isLoading: settingsLoading } = useSettings();
  const paymentGateway = settings?.paymentGateway,
    siteTitle = settings?.siteTitle,
    siteLink = settings?.siteLink,
    copyrightText = settings?.copyrightText,
    externalText = settings?.externalText,
    externalLink = settings?.externalLink,
    contactDetails = settings?.contactDetails;

  const date = new Date();

  return (
    <div className="flex w-full flex-col border-t border-gray-800 border-t-border-100 bg-white px-5 md:px-10 lg:border-b-8 lg:px-[50px] xl:px-16">
      {/* Top */}
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 pt-16 md:grid-cols-3 lg:pt-24 lg:pb-16 xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:gap-8 2xl:grid-cols-5">
        <div className="flex flex-col">
          <div className="mb-[2px] flex h-16 items-start">
            <Logo />
          </div>

          {settingsLoading ? (
            <SVGLoaderIcon className="text-2xl" />
          ) : (
            <>
              {contactDetails?.location?.formattedAddress ? (
                <Link
                  href={`https://www.google.com/maps/place/${contactDetails?.location?.formattedAddress}`}
                  className="text-sm not-italic mb-7 text-heading"
                >
                  {contactDetails?.location?.formattedAddress}
                </Link>
              ) : (
                ''
              )}
              {contactDetails?.emailAddress ? (
                <Link
                  className="mb-1 text-sm text-heading"
                  href={`mailto:${contactDetails?.emailAddress}`}
                >
                  {contactDetails?.emailAddress}
                </Link>
              ) : (
                ''
              )}
              {contactDetails?.contact ? (
                <Link
                  className="text-sm text-heading"
                  href={`tel:${contactDetails?.contact}`}
                >
                  {contactDetails?.contact}
                </Link>
              ) : (
                ''
              )}
            </>
          )}

          <div>
            {settingsLoading ? (
              <SVGLoaderIcon className="text-xl" />
            ) : (
              <div className="flex items-center gap-4 mt-4">
                {contactDetails?.socials?.map(
                  //@ts-ignore
                  (social: { url: string; icon: string }, index: number) => {
                    return social?.url ? (
                      <Link
                        href={social?.url}
                        key={index}
                        target="_blank"
                        className="text-accent hover:text-accent-hover"
                      >
                        {getIcon({
                          iconList: socialIcons,
                          iconName: social?.icon,
                          className: 'w-[20px] h-[20px]',
                        })}
                      </Link>
                    ) : (
                      ''
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>

        {siteSettings?.footer?.menus?.map((menu, idx) => (
          <div className="flex flex-col" key={`${menu.title}-${idx}`}>
            <h3 className="mt-3 mb-4 font-semibold text-heading lg:mb-7">
              {t(menu.title)}
            </h3>

            <ul className="space-y-3">
              {menu.links.map((link, index) => (
                <li key={`${link.href}-${index}`}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors text-heading hover:text-orange-500"
                  >
                    {t(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-full md:col-span-2 lg:col-auto">
          <SubscriptionWidget
            title="text-subscribe-now"
            description="text-subscribe-details"
          />
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center w-full gap-2 pt-8 pb-20 mt-8 border-t border-gray-200 lg:mt-0 lg:flex-row lg:justify-between lg:border-t-0 lg:pb-12">
        {/* <span className="order-2 text-sm text-heading lg:order-1">
          &copy; {t('text-copyright')} {new Date().getFullYear()}{' '}
          <Link
            className="font-bold transition-colors text-heading hover:text-accent"
            href={siteSettings.footer.copyright.href}
          >
            {siteSettings.footer.copyright.name}.
          </Link>{' '}
          {t('text-rights-reserved')}
        </span> */}
        {settingsLoading ? (
          <SVGLoaderIcon className="text-xl" />
        ) : (
          <span className="order-2 text-sm shrink-0 text-heading lg:order-1">
            ©{date.getFullYear()}{' '}
            <Link
              className="font-medium text-heading"
              href={siteLink ?? Routes?.home}
            >
              {siteTitle}
            </Link>
            . {copyrightText}{' '}
            {externalText ? (
              <Link
                className="font-medium text-heading"
                href={externalLink ?? Routes?.home}
              >
                {externalText}
              </Link>
            ) : (
              ''
            )}
          </span>
        )}

        {/* {siteSettings.footer.payment_methods && (
          <div className="flex items-center order-1 mb-5 space-x-5 rtl:space-x-reverse lg:order-2 lg:mb-0">
            {siteSettings.footer.payment_methods.map((method, idx) => (
              <Link
                className="relative flex items-center w-auto h-5 overflow-hidden"
                key={`${method.url}-${idx}`}
                href={method.url}
              >
                <img src={method.img} className="max-w-full max-h-full" />
              </Link>
            ))}
          </div>
        )} */}
        <div className="flex flex-wrap items-center justify-center order-1 gap-4 mb-5 lg:order-2 lg:mb-0 lg:justify-end lg:gap-x-5 lg:gap-y-3">
          {settingsLoading ? (
            <SVGLoaderIcon className="text-xl" />
          ) : !isEmpty(paymentGateway) && settings?.useEnableGateway ? (
            paymentGateway?.map(
              //@ts-ignore
              (method: { name: string; title: string }, index: number) => {
                return icon[method?.name] ? (
                  <div
                    className="relative flex items-center w-auto h-5 overflow-hidden text-5xl"
                    key={index}
                  >
                    {icon[method?.name]}
                  </div>
                ) : (
                  ''
                );
              },
            )
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;

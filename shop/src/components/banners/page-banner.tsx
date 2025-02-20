import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { HomeIconNew } from '@/components/icons/home-icon-new';
import { Routes } from '@/config/routes';
import { ArrowNext } from '@/components/icons';

type PageBannerProps = {
  title: string;
  breadcrumbTitle: string;
};

const PageBanner = ({ title, breadcrumbTitle }: PageBannerProps) => {
  return (
    <div className="flex w-full justify-center bg-slate-200 py-20 md:min-h-[250px] lg:min-h-[288px]">
      <div className="relative flex w-full flex-col items-center justify-center">
        {title ? (
          <h1 className="text-brand-dark text-center text-xl font-bold md:text-2xl lg:text-3xl 2xl:text-[40px]">
            <span className="font-manrope mb-3 block font-bold md:mb-4 lg:mb-5 2xl:mb-7 ">
              {title}
            </span>
          </h1>
        ) : (
          ''
        )}
        <div className="flex items-center">
          <ul className="flex w-full items-center overflow-hidden">
            {breadcrumbTitle ? (
              <li className="px-2.5 text-sm text-heading transition duration-200 ease-in hover:text-accent ltr:first:pl-0 ltr:last:pr-0 rtl:first:pr-0 rtl:last:pl-0">
                <Link href={Routes.home} className="inline-flex items-center">
                  <HomeIconNew className="ltr:mr-1.5 rtl:ml-1.5" />
                  {breadcrumbTitle}
                </Link>
              </li>
            ) : (
              ''
            )}
            {title ? (
              <>
                <li className="mt-[1px] text-base text-muted">
                  <ArrowNext className="h-4 w-4" />
                </li>
                <li className="px-2.5 text-sm text-body transition duration-200 ease-in ltr:first:pl-0 ltr:last:pr-0 rtl:first:pr-0 rtl:last:pl-0">
                  {title}
                </li>
              </>
            ) : (
              ''
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PageBanner;

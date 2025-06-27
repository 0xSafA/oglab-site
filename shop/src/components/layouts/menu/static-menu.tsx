import { ArrowDownIcon } from '@/components/icons/arrow-down';
import Link from '@/components/ui/link';
import { useTranslation } from 'next-i18next';
import { siteSettings } from '@/config/site';

const StaticMenu = () => {
  const { t } = useTranslation('common');
  const { headerLinks } = siteSettings;
  return (
    <>
      {headerLinks?.slice(0, 3)?.map(({ href, label, icon }) => (
        <li key={`${href}${label}`}>
          <Link
            href={href}
            className="flex items-center font-normal text-heading no-underline transition duration-200 hover:text-accent focus:text-accent"
          >
            {icon && <span className="ltr:mr-2 rtl:ml-2">{icon}</span>}
            {t(label)}
          </Link>
        </li>
      ))}
      <li className="menuItem group relative mx-3 cursor-pointer py-3 xl:mx-4">
        <div className="flex items-center gap-2 group-hover:text-accent">
          <span className="text-brand-dark group-hover:text-brand relative inline-flex items-center py-2 font-normal rtl:left-0">
            {t('text-pages')}
          </span>
          <ArrowDownIcon className="mt-1" />
        </div>
        <ul className="shadow-dropDown invisible absolute top-full z-30 w-[220px] rounded-md bg-light py-4 opacity-0 shadow transition-all duration-300 group-hover:visible group-hover:opacity-100 ltr:left-0 rtl:right-0 xl:w-[240px]">
          {headerLinks
            ?.slice(3, headerLinks?.length)
            ?.map(({ href, label }, index) => (
              <li
                className="menu-child-item font-chivo hover:filter-green group py-[10px] px-[22px] transition-all duration-200 hover:pl-[25px] hover:opacity-100"
                key={index}
              >
                <Link
                  href={href}
                  className="flex items-center font-normal text-heading no-underline transition duration-200 hover:text-accent focus:text-accent"
                >
                  {t(label)}
                </Link>
              </li>
            ))}
        </ul>
      </li>
    </>
  );
};

export default StaticMenu;

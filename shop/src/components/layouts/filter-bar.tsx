import { FilterIcon } from '@/components/icons/filter-icon';
import { useTranslation } from 'next-i18next';
import { useAtom } from 'jotai';
import { drawerAtom } from '@/store/drawer-atom';
import GroupsDropdownMenu from './menu/groups-menu';
import classNames from 'classnames';
import { checkIsMaintenanceModeComing } from '@/lib/constants';
import { twMerge } from 'tailwind-merge';

export default function FilterBar({
  className,
  variables,
}: {
  className?: string;
  variables: any;
}) {
  const { t } = useTranslation('common');
  const [_, setDrawerView] = useAtom(drawerAtom);
  const [underMaintenanceIsComing] = useAtom(checkIsMaintenanceModeComing);
  return (
    <div
      className={twMerge(
        classNames(
          'sticky z-20 flex h-14 items-center justify-between border-t border-b border-border-200 bg-light py-3 px-5 md:h-16 lg:px-6 xl:hidden',
          className,
          underMaintenanceIsComing
            ? 'top-[6.875rem]'
            : 'top-[58px] lg:top-[84px]',
        ),
      )}
    >
      <button
        onClick={() =>
          setDrawerView({ display: true, view: 'FILTER_VIEW', data: variables })
        }
        className="flex h-8 items-center rounded border border-border-200 bg-gray-100 bg-opacity-90 py-1 px-3 text-sm font-semibold text-heading transition-colors duration-200 hover:border-accent-hover hover:bg-accent hover:text-light focus:border-accent-hover focus:bg-accent focus:text-light focus:outline-0 md:h-10 md:py-1.5 md:px-4 md:text-base"
      >
        <FilterIcon width="18" height="14" className="ltr:mr-2 rtl:ml-2" />
        {t('text-filter')}
      </button>
      <GroupsDropdownMenu />
    </div>
  );
}

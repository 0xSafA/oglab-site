import React, { useState, useEffect } from 'react';
import Scrollbar from '@/components/ui/scrollbar';
import NotFound from '@/components/ui/not-found';
import TreeMenu from '@/components/ui/tree-menu';
import CategoriesLoader from '@/components/ui/loaders/categories-loader';
import { isMobile } from 'react-device-detect';
import type { Category } from '@/types';
import { checkIsMaintenanceModeComing } from '@/lib/constants';
import classNames from 'classnames';
import { useAtom } from 'jotai';

interface StickySidebarListCategoriesProps {
  notFound: boolean;
  loading: boolean;
  categories: Category[];
  className?: string;
}

const StickySidebarListCategories: React.FC<
  StickySidebarListCategoriesProps
> = ({ notFound, categories, loading, className }) => {
  const [underMaintenanceIsComing] = useAtom(checkIsMaintenanceModeComing);
  // const [_isMobile, setMobile] = useState(false);

  // useEffect(() => {
  //   setMobile(isMobile);
  // }, [setMobile]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <div className="hidden xl:block">
        <div className="mt-8 w-72 px-2">
          <CategoriesLoader />
        </div>
      </div>
    );
  }
  return (
    <aside
      className={classNames(
        `hidden h-full bg-light lg:sticky xl:block xl:w-72 ${className}`,
        underMaintenanceIsComing ? '' : 'lg:top-22',
      )}
    >
      {!isMobile && (
        <div className="max-h-full grow overflow-hidden">
          <Scrollbar
            className="max-h-screen w-full"
            style={{ height: 'calc(100vh - 5.35rem)' }}
          >
            {!notFound ? (
              isClient ? (
                <div className="px-5">
                  <TreeMenu items={categories} className="xl:py-8 px-5" />
                </div>
              ) : (
                ''
              )
            ) : (
              <div className="min-h-full w-full px-9 pt-6 pb-8 lg:p-8">
                <NotFound text="text-no-category" className="h-96" />
              </div>
            )}
          </Scrollbar>
        </div>
      )}

      {isMobile && (
        <div className="max-h-full grow overflow-hidden">
          {!notFound ? (
            isClient ? (
              <div className="px-5">
                <TreeMenu items={categories} className="xl:py-8" />
              </div>
            ) : (
              ''
            )
          ) : (
            <div className="min-h-full w-full px-9 pt-6 pb-8 lg:p-8">
              <NotFound text="text-no-category" className="h-96" />
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default StickySidebarListCategories;

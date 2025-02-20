import cn from 'classnames';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Avatar from '@/components/common/avatar';
import Link from '@/components/ui/link';
import { siteSettings } from '@/settings/site.settings';
import { useTranslation } from 'next-i18next';
import { useMeQuery } from '@/graphql/me.graphql';
import { getIcon } from '@/utils/get-icon';
import * as sidebarIcons from '@/components/icons/sidebar';
// import { useRouter } from 'next/router';
import { getAuthCredentials } from '@/utils/auth-utils';

export default function AuthorizedMenu() {
  const { data } = useMeQuery();
  const { t } = useTranslation('common');
  // const { pathname, query } = useRouter();
  // const slug = (pathname === '/[shop]' && query?.shop) || '';
  const { role } = getAuthCredentials();
  // Again, we're using framer-motion for the transition effect
  return (
    <Menu
      as="div"
      className="relative inline-block shrink-0 grow-0 basis-auto py-2 text-left ps-1.5 sm:border-solid sm:border-gray-200 sm:py-3 sm:ps-6 sm:border-s lg:py-4 xl:py-2"
    >
      <Menu.Button className="flex max-w-[150px] items-center gap-2 focus:outline-none lg:py-0.5 xl:py-2.5">
        <Avatar
          src={
            data?.me?.profile?.avatar?.thumbnail ??
            siteSettings?.avatar?.placeholder
          }
          rounded="full"
          name={data?.me?.name as string}
          className="shrink-0 grow-0 basis-auto drop-shadow"
        />
        <div className="hidden w-[calc(100%-48px)] flex-col items-start space-y-0.5 truncate text-sm ltr:text-left rtl:text-right xl:flex">
          <span className="w-full truncate font-semibold capitalize text-black">
            {data?.me?.name}
          </span>
          <span className="w-full truncate text-xs capitalize text-gray-400">
            {role ? role.split('_').join(' ') : data?.me?.email}
          </span>
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className="authorized-menu shadow-box absolute mt-3 w-56 rounded-lg border border-gray-200 bg-white end-0 origin-top-end focus:outline-none lg:mt-4 xl:mt-2"
        >
          <Menu.Item>
            <li className="border-b border-dashed border-gray-200 p-2 focus:outline-none">
              <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2">
                <Avatar
                  src={
                    data?.me?.profile?.avatar?.thumbnail ??
                    siteSettings?.avatar?.placeholder
                  }
                  name={data?.me?.name as string}
                  className="shrink-0 grow-0 basis-auto drop-shadow"
                />
                <div className="flex w-[calc(100%-40px)] flex-col items-start space-y-0.5 text-sm">
                  <span className="w-full truncate font-semibold capitalize text-black">
                    {data?.me?.name}
                  </span>
                  <span className="break-all text-xs text-gray-400">
                    {data?.me?.email}
                  </span>
                </div>
              </div>
            </li>
          </Menu.Item>
          <div className="space-y-0.5 py-2">
            {siteSettings?.authorizedLinks?.map(
              ({ href, labelTransKey, icon, permission }) => {
                const hasPermission = permission?.includes(role!);
                return (
                  <>
                    {hasPermission && (
                      <Menu.Item key={`${href}${labelTransKey}`}>
                        {({ active }) => (
                          <>
                            <li
                              className={cn(
                                'cursor-pointer border-dashed border-gray-200 px-2 last:!mt-2.5 last:border-t last:pt-2'
                              )}
                            >
                              <Link
                                href={href}
                                className={cn(
                                  'group flex items-center gap-2 rounded-md py-2.5 px-3 text-sm capitalize transition duration-200 hover:text-accent',
                                  active
                                    ? 'border-transparent bg-gray-100 text-accent'
                                    : 'text-heading'
                                )}
                              >
                                <span className="text-gray-600 group-hover:text-accent">
                                  {getIcon({
                                    iconList: sidebarIcons,
                                    iconName: icon,
                                    className: 'w-5 h-5',
                                  })}
                                </span>
                                {t(labelTransKey)}
                              </Link>
                            </li>
                          </>
                        )}
                      </Menu.Item>
                    )}
                  </>
                );
              }
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

import { useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { LangSwitcherIcon } from '@/components/icons/lang-switcher-icon';
import { languageMenu } from '@/lib/locals';
import Cookies from 'js-cookie';

export default function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { asPath, locale, locales } = router;

  let filterItem = languageMenu?.filter((element) =>
    locales?.includes(element?.id)
  );

  const currentSelectedItem = locale
    ? filterItem?.find((o) => o?.value === locale)!
    : filterItem[2];
  const [selectedItem, setSelectedItem] = useState(currentSelectedItem);

  function handleItemClick(values: any) {
    Cookies.set('NEXT_LOCALE', values?.value, { expires: 365 });
    setSelectedItem(values);
    router.push(asPath, undefined, {
      locale: values?.value,
    });
  }

  return (
    <Listbox value={selectedItem} onChange={handleItemClick}>
      {({ open }) => (
        <div className="lg:ms-0 relative z-10">
          {/* <div className="ms-2 lg:ms-0 relative z-10 2xl:w-[130px]"> */}
          <Listbox.Button className="relative flex h-full w-full cursor-pointer items-center rounded-full border border-border-200 bg-light p-1 text-[13px] font-semibold focus:outline-0 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 xl:border-solid xl:text-sm xl:text-heading">
            {/* <Listbox.Button className="relative flex h-full w-full cursor-pointer items-center rounded text-[13px] font-semibold focus:outline-0 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 xl:border-solid xl:text-sm xl:text-heading 2xl:h-auto 2xl:w-full 2xl:border 2xl:border-[#CFD3DA] 2xl:bg-white 2xl:py-2 2xl:ltr:pl-3  2xl:ltr:pr-7 2xl:rtl:pl-7 2xl:rtl:pr-3"> */}
            <span className="relative block h-7 w-7 overflow-hidden rounded-full">
              {/* <span className="relative block w-8 h-8 overflow-hidden rounded-full 2xl:hidden"> */}
              <span className="relative top-0 block">
                {selectedItem.iconMobile}
              </span>
            </span>
            {/* <span className="items-center hidden truncate 2xl:flex">
              <span className="text-xl ltr:mr-3 rtl:ml-3">
                {selectedItem.icon}
              </span>{' '}
              {t(selectedItem.name)}
            </span> */}
            {/* <span className="absolute inset-y-0 items-center hidden pointer-events-none ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2 2xl:flex">
              <LangSwitcherIcon className="text-gray-400" aria-hidden="true" />
            </span> */}
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              static
              className={`absolute mt-3.5 max-h-60 w-[130px] -translate-y-0.5 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-0 ltr:right-0 rtl:left-0 lg:mt-6`}
            >
              {filterItem?.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `${active ? 'bg-gray-100 text-amber-900' : 'text-gray-900'}
												relative cursor-pointer select-none py-2 px-3`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <span className="flex items-center">
                      <span className="text-xl">{option.icon}</span>
                      <span
                        className={`${
                          selected ? 'font-medium' : 'font-normal'
                        } block truncate ltr:ml-1.5 rtl:mr-1.5`}
                      >
                        {t(option.name)}
                      </span>
                      {selected ? (
                        <span
                          className={`${active && 'text-amber-600'}
                                 absolute inset-y-0 flex items-center ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3`}
                        />
                      ) : null}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}

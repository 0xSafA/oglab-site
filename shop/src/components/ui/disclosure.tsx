import { Disclosure as HeadlessDisclosure } from '@headlessui/react';
import { ArrowDownIcon } from '@/components/icons/arrow-down';
import { useTranslation } from 'next-i18next';

type DisclosureProps = {
  title: string;
  children: React.ReactNode;
};

export const CustomDisclosure: React.FC<DisclosureProps> = ({
  title,
  children,
  ...props
}) => {
  const { t } = useTranslation('common');
  return (
    <HeadlessDisclosure defaultOpen={true} {...props}>
      {({ open }) => (
        <>
          <HeadlessDisclosure.Button className="flex w-full items-center justify-between focus:outline-0 focus:ring-1 focus:ring-accent focus:ring-opacity-40">
            <span className="font-bold text-heading">{t(title)}</span>
            <ArrowDownIcon
              className={`h-2.5 w-2.5 ${open ? 'rotate-180 transform' : ''}`}
            />
          </HeadlessDisclosure.Button>
          <HeadlessDisclosure.Panel className="pt-4">
            {children}
          </HeadlessDisclosure.Panel>
        </>
      )}
    </HeadlessDisclosure>
  );
};

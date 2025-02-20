import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { customerContactAtom } from '@/store/checkout';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { PlusIcon } from '@/components/icons/plus-icon';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';
import PhoneInput from '@/components/ui/forms/phone-input';

interface ContactProps {
  contact: string | undefined | null;
  label: string;
  count?: number;
  className?: string;
  gridClassName?: string;
}

const ContactGrid = ({
  contact,
  label,
  count,
  className,
  gridClassName,
}: ContactProps) => {
  const [contactNumber, setContactNumber] = useAtom(customerContactAtom);
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (contact) {
      setContactNumber(contact);
      return;
    }
    setContactNumber('');
  }, [contact, setContactNumber]);

  function onAddOrChange() {
    openModal('ADD_OR_UPDATE_CHECKOUT_CONTACT');
  }

  return (
    <div className={className}>
      <div
        className={classNames('mb-5 flex items-center justify-between', {
          'md:mb-8': count,
        })}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse md:space-x-4">
          {count && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base text-light lg:text-xl">
              {count}
            </span>
          )}
          <p className="text-lg capitalize text-heading lg:text-xl">{label}</p>
        </div>

        <button
          className="flex items-center text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-hover focus:text-accent-hover focus:outline-0"
          onClick={onAddOrChange}
        >
          <PlusIcon className="h-4 w-4 stroke-2 ltr:mr-0.5 rtl:ml-0.5" />
          {contactNumber ? t('text-update') : t('text-add')}
        </button>
      </div>

      <div className={classNames('w-full', gridClassName)}>
        <PhoneInput
          country="us"
          value={contactNumber}
          disabled={true}
          inputClass="!p-0 ltr:!pr-4 rtl:!pl-4 ltr:!pl-14 rtl:!pr-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !border-border-base !rounded focus:!border-accent !h-12"
          dropdownClass="focus:!ring-0 !border !border-border-base !shadow-350"
        />
      </div>
    </div>
  );
};

export default ContactGrid;

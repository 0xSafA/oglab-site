import { PlusIcon } from '@/components/icons/plus-icon';
import { useTranslation } from 'next-i18next';

interface AddressHeaderProps {
  count: number | boolean;
  label: string;
  onAdd: () => void;
}

export const AddressHeader: React.FC<AddressHeaderProps> = ({
  onAdd,
  count,
  label,
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="mb-5 flex items-center justify-between md:mb-8">
      <div className="flex items-center space-x-3 rtl:space-x-reverse md:space-x-4">
        {count && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base text-light lg:text-xl">
            {count}
          </span>
        )}
        <p className="text-lg capitalize text-heading lg:text-xl">{label}</p>
      </div>
      {onAdd && (
        <button
          className="flex items-center text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-hover focus:text-accent-hover focus:outline-0"
          onClick={onAdd}
        >
          <PlusIcon className="h-4 w-4 stroke-2 ltr:mr-0.5 rtl:ml-0.5" />
          {t('text-add')}
        </button>
      )}
    </div>
  );
};

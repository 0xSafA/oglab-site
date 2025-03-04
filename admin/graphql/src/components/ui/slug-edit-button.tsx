import { EditIcon } from '@/components/icons/edit';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { twMerge } from 'tailwind-merge';

const SlugEditButton = ({
  className,
  onClick,
  ...rest
}: {
  className?: string;
  onClick: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <button
      className={twMerge(
        classNames(
          'absolute top-[27px] right-px flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none',
          className
        )
      )}
      type="button"
      title={t('common:text-edit')}
      onClick={onClick}
      {...rest}
    >
      <EditIcon width={14} />
    </button>
  );
};

export default SlugEditButton;

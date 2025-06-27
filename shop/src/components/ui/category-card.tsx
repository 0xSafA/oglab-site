import { Image } from '@/components/ui/image';
import { productPlaceholder } from '@/lib/placeholders';
import { formatString } from '@/lib/format-string';
import { useTranslation } from 'next-i18next';

interface CategoryItemProps {
  item: any;
  onClick: () => void;
}
const CategoryCard: React.FC<CategoryItemProps> = ({ item, onClick }) => {
  const { t } = useTranslation('common');

  return (
    <div
      className="group relative h-80 w-full rounded-lg bg-light p-8 shadow-downfall-sm transition-shadow hover:shadow-downfall-lg"
      onClick={onClick}
      role="button"
    >
      <div className="relative z-10 flex h-full flex-1 flex-col">
        <h3 className="mb-1 text-lg font-semibold text-heading">{item.name}</h3>
        <span className="text-s text-body">
          {item?.children?.length
            ? `${item?.children?.length} ${
                item?.children?.length > 1
                  ? t('text-categories')
                  : t('text-category')
              }`
            : item?.children?.length
            ? formatString(item?.products_count, 'Item')
            : ''}
        </span>

        <button className="mt-auto flex text-sm font-semibold text-accent underline opacity-100 transition-opacity group-hover:opacity-100 lg:opacity-0">
          {t('text-view-more')}
        </button>
      </div>

      <div className="absolute bottom-0 h-full w-full overflow-hidden rounded-lg ltr:right-0 rtl:left-0">
        <Image
          className="h-full w-full"
          src={item?.image?.original ?? productPlaceholder}
          alt={item?.name ?? ''}
          width={432}
          height={336}
        />
      </div>
    </div>
  );
};

export default CategoryCard;

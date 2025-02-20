import Router from 'next/router';
import { useTranslation } from 'next-i18next';
interface Props {
  tags: any;
  basePath: string;
  onClose?: () => void;
}

const TagGroups = ({ onClose, tags, basePath }: Props) => {
  const { t } = useTranslation('common');

  const handleClick = (path: string) => {
    Router.push(path);
    if (onClose) {
      onClose();
    }
  };
  return (
    <div className="flex w-full flex-col items-start">
      <span className="pb-3 text-sm font-semibold capitalize text-heading">
        {t('text-tags')}
      </span>
      <div className="flex flex-row flex-wrap">
        {tags?.map((tag: any) => (
          <button
            onClick={() => handleClick(`${basePath}?tag=${tag.slug}`)}
            key={tag.id}
            className="bg-transparent text-sm text-body transition-colors after:content-[','] last:after:content-[''] hover:text-accent focus:bg-opacity-100 focus:outline-0 ltr:pr-0.5 ltr:last:pr-0 rtl:pl-0.5 rtl:last:pl-0"
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagGroups;

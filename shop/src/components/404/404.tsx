import { useTranslation } from 'next-i18next';
import noResult from '@/assets/no-result.svg';
import { Image } from '@/components/ui/image';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';

type NotFoundProps = {
  title?: string;
  subTitle?: string;
  image?: string;
  link?: string;
  linkTitle?: string;
};

const NotFound: React.FC<NotFoundProps> = ({
  title = '404-heading',
  subTitle = '404-sub-heading',
  image = noResult,
  link = Routes.home,
  linkTitle = '404-back-home',
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-screen place-items-center p-4 sm:p-8">
      <div className="text-center">
        {title ? (
          <p className="2xl: mb-4 text-sm uppercase tracking-widest text-body-dark sm:mb-5">
            {t(title)}
          </p>
        ) : (
          ''
        )}
        {subTitle ? (
          <h1 className="mb-5 text-2xl font-bold leading-normal text-bolder sm:text-3xl">
            {t(subTitle)}
          </h1>
        ) : (
          ''
        )}
        {image ? (
          <div className="mb-11">
            <Image src={image} alt={t(title)} />
          </div>
        ) : (
          ''
        )}
        {link ? (
          <Link
            href={link}
            className="inline-flex items-center text-bolder underline hover:text-body-dark hover:no-underline focus:outline-none sm:text-base"
          >
            {t(linkTitle)}
          </Link>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default NotFound;

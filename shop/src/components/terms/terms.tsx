import { RefundPolicy, TermsAndConditions } from '@/types';
import rangeMap from '@/lib/range-map';
import { Link as AnchorLink, Element } from 'react-scroll';
import TermsListLoader from '@/components/ui/loaders/terms-list-loader';
import TermsLoader from '@/components/ui/loaders/terms-loader';
import { useTranslation } from 'next-i18next';
import { useSanitizeContent } from '@/lib/sanitize-content';

type TermsProps = {
  isLoading: boolean;
  terms: RefundPolicy[] | TermsAndConditions[];
};

export const makeTitleToDOMId = (title: string) => {
  return title?.toLowerCase().split(' ').join('_');
};

const Terms = ({ isLoading, terms }: TermsProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col md:flex-row">
      <nav className="mb-8 hidden md:mb-0 md:block md:w-60 lg:w-72 xl:w-80">
        <ol className="sticky z-10 md:top-28 lg:top-24">
          {isLoading && !terms?.length ? (
            <>
              <TermsListLoader />
            </>
          ) : (
            terms?.map((item: RefundPolicy | TermsAndConditions) => (
              <li key={item?.title}>
                <AnchorLink
                  spy={true}
                  offset={0}
                  smooth={true}
                  duration={500}
                  to={makeTitleToDOMId(item?.title)}
                  activeClass="text-sm lg:text-base !text-accent font-semibold relative before:absolute before:h-full before:w-0.5 before:h-5 before:top-0.5 before:left-0 before:bg-accent"
                  className="my-3 inline-flex cursor-pointer pl-4 text-sub-heading"
                >
                  {t(item?.title)}
                </AnchorLink>
              </li>
            ))
          )}
        </ol>
      </nav>
      {/* End of section scroll spy menu */}

      <div className="md:w-9/12 md:pb-10 ltr:md:pl-8 rtl:md:pr-8">
        {isLoading && !terms?.length ? (
          <>
            {rangeMap(3, (i) => (
              <TermsLoader key={i} uniqueKey={`terms-${i}`} />
            ))}
          </>
        ) : (
          terms?.map((item: RefundPolicy | TermsAndConditions, index) => (
            <TermsItems item={item} key={index} />
          ))
        )}
      </div>
      {/* End of content */}
    </div>
  );
};

export const TermsItems = ({
  item,
}: {
  item: RefundPolicy | TermsAndConditions;
}) => {
  const content = useSanitizeContent({
    description: item?.description as string,
  });
  return (
    <Element
      key={item?.title}
      name={makeTitleToDOMId(item?.title)}
      className="mb-7 md:mb-10"
    >
      <h2 className="mb-4 text-lg font-bold text-heading md:text-xl lg:text-2xl">
        {item?.title}
      </h2>
      {content ? (
        <div
          className="mt-15 leading-loose text-body-dark react-editor-description"
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        />
      ) : (
        ''
      )}
    </Element>
  );
};

export default Terms;

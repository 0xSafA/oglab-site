import { useState } from 'react';
import cn from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { MinusIcon } from '@/components/icons/minus-icon';
import { PlusIcon } from '@/components/icons/plus-icon';
import { heightCollapse } from '@/lib/motion/height-collapse';
import { useTranslation } from 'next-i18next';
import { useSanitizeContent } from '@/lib/sanitize-content';
import classNames from 'classnames';
import { padStart } from 'lodash';

type CollapseProps = {
  i: number;
  title: string;
  content: string;
  translatorNS: string;
  expanded: number;
  setExpanded: any;
  variant?: 'default' | 'shadow';
  numberIndexing?: boolean;
};

const Collapse: React.FC<CollapseProps> = ({
  i,
  expanded,
  setExpanded,
  title,
  content,
  translatorNS,
  variant = 'default',
  numberIndexing = false,
}) => {
  const isOpen = i === expanded;
  // active state style
  const activeClass = isOpen
    ? variant === 'shadow'
      ? 'shadow-[0px_10px_40px_0px_rgba(187,199,206,0.25)]'
      : 'shadow-sm'
    : '';

  const { t } = useTranslation(translatorNS);
  const description = useSanitizeContent({ description: content });

  const variantClasses = classNames({
    'border border-solid border-border-200 hover:border-border-base':
      variant === 'default',
    'shadow-collapse': variant === 'shadow',
  });

  return (
    <div
      className={cn(
        'bg-light rounded mb-2.5 transition-all ',
        variantClasses,
        activeClass,
      )}
    >
      <motion.header
        initial={false}
        onClick={() => setExpanded(isOpen ? false : i)}
        className="py-4 px-5 rounded cursor-pointer flex items-center justify-between transition-colors"
      >
        <h2 className="text-sm md:text-lg font-semibold leading-relaxed text-heading">
          {!!numberIndexing ? `${(i + 1).toString().padStart(2, '0')}. ` : null}
          {t(title)}
        </h2>
        {isOpen ? (
          <MinusIcon
            className="flex-shrink-0 stroke-2"
            width={18}
            height={18}
          />
        ) : (
          <PlusIcon className="flex-shrink-0 stroke-2" width={20} height={20} />
        )}
      </motion.header>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="from"
            animate="to"
            exit="from"
            variants={heightCollapse()}
          >
            <div className="md:pt-1 pb-4 px-5 pl-10 leading-7 text-sm md:text-base md:leading-loose text-body-dark">
              {description ? (
                <div
                  className="react-editor-description"
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                />
              ) : (
                ''
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

type AccordionProps = {
  translatorNS: string;
  items: {
    title: string;
    content: string;
  }[];
  variant?: 'default' | 'shadow';
  numberIndexing?: boolean;
};

const Accordion: React.FC<AccordionProps> = ({
  items,
  translatorNS,
  variant = 'default',
  numberIndexing = false,
}) => {
  const [expanded, setExpanded] = useState<number>(0);
  return (
    <>
      {items.map(({ title, content }, index) => (
        <Collapse
          i={index}
          key={title}
          title={title}
          content={content}
          expanded={expanded}
          setExpanded={setExpanded}
          translatorNS={translatorNS}
          variant={variant}
          numberIndexing={numberIndexing}
        />
      ))}
    </>
  );
};

export default Accordion;

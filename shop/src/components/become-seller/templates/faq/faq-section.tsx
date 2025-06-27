import Accordion from '@/components/ui/accordion';
import SectionHeading from '@/components/ui/section-heading';
import { cn } from '@/lib/cn';
import { BecomeSellerPageOptions } from '@/types';
import React from 'react';

interface FaqSectionProps
  extends Pick<
    BecomeSellerPageOptions,
    'faqTitle' | 'faqDescription' | 'faqItems'
  > {
  className?: string;
}

function prepareForAccordion(data: any[]) {
  return data.map((item) => ({
    title: item?.title,
    content: item?.description,
  }));
}

export default function FaqSection({
  faqTitle,
  faqDescription,
  faqItems,
  className,
}: FaqSectionProps) {
  return (
    <section className={cn('pt-20 pb-[70px] bg-white', className)}>
      <div className="mx-auto max-w-[94.75rem] px-4">
        <SectionHeading title={faqTitle} subtitle={faqDescription} />
        <div className="max-w-[1000px] mx-auto">
          <Accordion
            items={prepareForAccordion(faqItems)}
            translatorNS="faq"
            variant="shadow"
            numberIndexing={true}
          />
        </div>
      </div>
    </section>
  );
}

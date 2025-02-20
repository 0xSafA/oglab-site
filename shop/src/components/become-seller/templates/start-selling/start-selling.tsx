import { cn } from '@/lib/cn';
import { BecomeSellerPageOptions } from '@/types';
import React from 'react';
import SellingStep from './selling-step';
import SectionHeading from '@/components/ui/section-heading';

interface StartSellingProps
  extends Pick<
    BecomeSellerPageOptions,
    'sellingStepsItem' | 'sellingStepsTitle' | 'sellingStepsDescription'
  > {
  className?: string;
}

function StartSelling({
  sellingStepsItem,
  sellingStepsTitle,
  sellingStepsDescription,
  className,
}: StartSellingProps) {
  return (
    <section className={cn('pb-20', className)}>
      <div className="mx-auto max-w-[94.75rem] px-4">
        <SectionHeading
          title={sellingStepsTitle}
          subtitle={sellingStepsDescription}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 2xl:gap-x-[100px] gap-y-[80px]">
          {sellingStepsItem.map((sellingStep) => (
            <SellingStep sellingStep={sellingStep} key={sellingStep.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StartSelling;

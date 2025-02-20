import SuperAdminContactForm from '@/components/settings/super-admin-contact-form';
import SectionHeading from '@/components/ui/section-heading';
import { cn } from '@/lib/cn';
import React from 'react';

type ContactProps = {
  className?: string;
  data?: {
    title?: string;
    description?: string;
  };
};

export default function Contact({ className, data }: ContactProps) {
  return (
    <section className={cn('pb-20 bg-white', className)}>
      <div className="mx-auto max-w-[94.75rem] px-4">
        {data?.title ? (
          <SectionHeading title={data?.title} subtitle={data?.description} />
        ) : null}
        <div className="max-w-[1000px] mx-auto">
          <SuperAdminContactForm />
        </div>
      </div>
    </section>
  );
}

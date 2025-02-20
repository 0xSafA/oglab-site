import SubscriptionWidget from '@/components/settings/subscribe-to-newsletter';
import { useModalState } from '@/components/ui/modal/modal.context';
import Image from 'next/image';

const NewsLetter = () => {
  const {
    data: { title, description },
  } = useModalState();
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-light p-8 md:h-auto md:min-h-0 md:max-w-2xl md:p-16 lg:w-screen lg:max-w-[56.25rem]">
      <div className="mb-8">
        <Image
          src={'/news-letter-icon.png'}
          alt="news letter icon"
          width={115}
          height={125}
          className="mx-auto block"
        />
      </div>
      <div className="mb-8 text-center md:mb-16">
        {title ? (
          <h2 className="mb-3 text-2xl font-bold text-black md:text-4xl">
            {title}
          </h2>
        ) : (
          ''
        )}

        {description ? (
          <p className="mx-auto max-w-xl text-sm font-medium md:text-lg md:leading-8">
            {description}
          </p>
        ) : (
          ''
        )}
      </div>

      <div className="mx-auto max-w-md">
        <SubscriptionWidget />
      </div>
    </div>
  );
};

export default NewsLetter;

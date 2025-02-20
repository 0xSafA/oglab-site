import React from 'react';
import Countdown, { zeroPad } from 'react-countdown';

type NoticeCountdownProps = {
  date: string | number | Date | undefined;
};

const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) {
    return 'Ended';
  } else {
    return (
      <div className="inline-block">
        {!!days ? (
          <div className="mx-1 inline-flex min-h-[30px] min-w-[30px] shrink-0 items-center justify-center gap-1 p-1 font-medium text-white md:mx-1.5 md:min-w-[36px]">
            {days > 1 ? zeroPad(days) : days}
            <span className="truncate">{days === 1 ? 'day' : 'days'}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="mx-1 inline-flex min-h-[30px] min-w-[30px] shrink-0 items-center justify-center rounded bg-white p-1 font-medium text-black md:mx-1.5 md:min-w-[36px]">
              {zeroPad(hours)}
            </div>
            :
            <div className="mx-1 inline-flex min-h-[30px] min-w-[30px] shrink-0 items-center justify-center rounded bg-white p-1 font-medium text-black md:mx-1.5 md:min-w-[36px]">
              {zeroPad(minutes)}
            </div>
            :
            <div className="mx-1 inline-flex min-h-[30px] min-w-[30px] shrink-0 items-center justify-center rounded bg-white p-1 font-medium text-black md:mx-1.5 md:min-w-[36px]">
              {zeroPad(seconds)}
            </div>
          </div>
        )}
      </div>
    );
  }
};

const NoticeCountdown: React.FC<NoticeCountdownProps> = ({ date }) => {
  return <Countdown date={date} renderer={renderer} />;
};

export default NoticeCountdown;

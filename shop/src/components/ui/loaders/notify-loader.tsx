import ContentLoader from 'react-content-loader';
import rangeMap from '@/lib/range-map';

const NotifyLoader = ({ ...props }) => (
  <ContentLoader
    speed={2}
    backgroundColor="#F1F2F4"
    foregroundColor="#ecebeb"
    {...props}
  >
    {rangeMap(4, (i) => (
      <rect
        key={i}
        x="0"
        y={i * 15}
        rx="3"
        ry="3"
        width={`${100 - i * 10}%`}
        height="5"
      />
    ))}
  </ContentLoader>
);

export { NotifyLoader };

const NotifySingleContentLoader = ({ ...props }) => {
  return (
    <ContentLoader
      speed={2}
      backgroundColor="#F1F2F4"
      foregroundColor="#ecebeb"
      {...props}
    >
      {rangeMap(15, (i) => (
        <rect
          key={i}
          x="0"
          y={i * 40}
          rx="3"
          ry="3"
          width={`${100 - i * 5}%`}
          height="20"
        />
      ))}
    </ContentLoader>
  );
};

export { NotifySingleContentLoader };
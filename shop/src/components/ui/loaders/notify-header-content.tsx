import React from 'react';
import ContentLoader from 'react-content-loader';

const NotifyHeaderContentLoader = (props: any) => (
  <ContentLoader
    speed={2}
    backgroundColor="#F1F2F4"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="0" y="0" rx="3" ry="3" width="100%" height="5" />
    <rect x="0" y="10" rx="3" ry="3" width="80%" height="5" />
  </ContentLoader>
);

export default NotifyHeaderContentLoader;

export const ExternalIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
};

export const ExternalIconNew: React.FC<React.SVGAttributes<{}>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity={0.4}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.668 6.667a2.5 2.5 0 012.5-2.5h5a.833.833 0 110 1.666h-5a.833.833 0 00-.833.834v9.166c0 .46.373.834.833.834h9.167c.46 0 .833-.373.833-.834v-5a.833.833 0 111.667 0v5a2.5 2.5 0 01-2.5 2.5H4.168a2.5 2.5 0 01-2.5-2.5V6.667z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.34 7.5a.833.833 0 01-1.667 0V4.512L9.5 11.684a.833.833 0 11-1.179-1.178l7.172-7.173h-2.99a.833.833 0 110-1.666h5.002c.46 0 .833.373.833.833v5z"
        fill="currentColor"
      />
    </svg>
  );
};
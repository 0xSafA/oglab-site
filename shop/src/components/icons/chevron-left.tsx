export const ChevronLeft: React.FC<React.SVGAttributes<{}>> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

export const IosGhostArrowLeft: React.FC<React.SVGAttributes<{}>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7 3H4.5V.5a.5.5 0 00-.853-.354l-3 3a.5.5 0 000 .708l3 3A.5.5 0 004.5 6.5V4H7a5.506 5.506 0 015.5 5.5.5.5 0 001 0A6.507 6.507 0 007 3zM3.5 5.293L1.707 3.5 3.5 1.707v3.586z"
        fill="currentColor"
      />
    </svg>
  );
};
export const CalendarGhostIcon: React.FC<React.SVGAttributes<{}>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity={0.2}
        d="M13.5 3v2.5h-11V3a.5.5 0 01.5-.5h10a.5.5 0 01.5.5z"
        fill="currentColor"
      />
      <path
        d="M13 2h-1.5v-.5a.5.5 0 00-1 0V2h-5v-.5a.5.5 0 10-1 0V2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1zM4.5 3v.5a.5.5 0 101 0V3h5v.5a.5.5 0 001 0V3H13v2H3V3h1.5zM13 13H3V6h10v7z"
        fill="currentColor"
      />
    </svg>
  );
};

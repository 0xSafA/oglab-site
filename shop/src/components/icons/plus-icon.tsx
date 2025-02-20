export const PlusIcon: React.FC<React.SVGAttributes<{}>> = (props) => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 6v6m0 0v6m0-6h6m-6 0H6"
		/>
	</svg>
);


export const PlusIconNew: React.FC<React.SVGAttributes<{}>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 3.5v10m5-5H3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const CheckedIcon: React.FC<React.SVGAttributes<{}>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" {...props}>
      <g data-name="Group 36431" fill="currentColor">
        <path
          data-name="Path 22671"
          d="M6.5,0A6.5,6.5,0,1,0,13,6.5,6.508,6.508,0,0,0,6.5,0Zm3.633,4.789L5.979,8.911a.639.639,0,0,1-.9.016l-2.2-2a.661.661,0,0,1-.049-.912.644.644,0,0,1,.912-.033l1.743,1.6L9.2,3.861a.657.657,0,0,1,.929.929Z"
        />
      </g>
    </svg>
  );
};

export const CheckedIconWithCircle: React.FC<React.SVGAttributes<{}>> = (
  props,
) => {
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
        d="M8 0C3.589 0 0 3.589 0 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14.546A6.553 6.553 0 011.455 8 6.553 6.553 0 018 1.455 6.553 6.553 0 0114.546 8 6.553 6.553 0 018 14.546z"
        fill="currentColor"
      />
      <path
        d="M11 5.172L6.886 9.286 5 7.4a.727.727 0 00-1.028 1.028l2.4 2.4a.727.727 0 001.029 0L12.027 6.2A.727.727 0 0011 5.172z"
        fill="currentColor"
      />
    </svg>
  );
};
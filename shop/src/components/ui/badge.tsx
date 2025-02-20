import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { twMerge } from 'tailwind-merge';

type BadgeProps = {
  className?: string;
  color?: string;
  textColor?: string;
  text?: string;
  style?: any;
  animate?: boolean;
};

const Badge: React.FC<BadgeProps> = ({
  className,
  color: colorOverride,
  textColor: textColorOverride,
  text,
  style,
  animate = false,
}) => {
  const { t } = useTranslation();

  const classes = {
    root: 'px-3 py-1 rounded-full text-sm',
    default: 'bg-accent',
    animate: 'animate-pulse',
    text: 'text-light',
  };

  return (
    <span
      className={twMerge(
        cn(
          classes.root,
          {
            [classes.default]: !colorOverride,
            [classes.text]: !textColorOverride,
            [classes.animate]: animate,
          },
          colorOverride,
          textColorOverride,
          className,
          'inline-flex'
        )
      )}
      style={style}
    >
      {t(text!)}
    </span>
  );
};

export default Badge;

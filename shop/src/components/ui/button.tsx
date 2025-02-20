import { ButtonProps } from '@/types';
import cn from 'classnames';
import React from 'react';

const classes = {
  root: 'inline-flex items-center justify-center shrink-0 font-semibold leading-none rounded outline-none transition duration-300 ease-in-out focus:outline-0 focus:shadow focus:ring-1 focus:ring-accent-700',
  normal:
    'bg-accent text-light border border-transparent hover:bg-accent-hover',
  dark: 'bg-[#092635] hover:bg-[#091625] text-light border border-transparent',
  custom: 'border border-transparent',
  outline:
    'border border-border-400 bg-transparent text-body hover:text-light hover:bg-accent hover:border-accent',
  loading:
    'h-4 w-4 ltr:ml-2 rtl:mr-2 rounded-full border-2 border-transparent border-t-2 animate-spin',
  disabled:
    'border border-border-base bg-gray-300 hover:bg-gray-300 border-border-400 text-body cursor-not-allowed',
  disabledOutline: 'border border-border-base text-muted cursor-not-allowed',
  small: 'px-3 py-0 h-9 text-sm h-10',
  medium: 'px-5 py-0 h-12',
  big: 'px-6 py-5',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      variant = 'normal',
      size = 'medium',
      children,
      active,
      loading = false,
      disabled = false,
      ...rest
    } = props;
    const classesName = cn(
      classes.root,
      {
        [classes.normal]: !disabled && variant === 'normal',
        [classes.disabled]: disabled && variant === 'normal',
        [classes.outline]: !disabled && variant === 'outline',
        [classes.dark]: !disabled && variant === 'dark',
        [classes.disabledOutline]: disabled && variant === 'outline',
        [classes.small]: size === 'small',
        [classes.medium]: size === 'medium',
        [classes.big]: size === 'big',
      },
      className,
    );

    return (
      <button
        aria-pressed={active}
        data-variant={variant}
        ref={ref}
        className={classesName}
        disabled={disabled}
        {...rest}
      >
        {children}
        {loading && (
          <span
            className={classes.loading}
            style={{
              borderTopColor:
                variant === 'outline' ? 'currentColor' : '#ffffff',
            }}
          />
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;

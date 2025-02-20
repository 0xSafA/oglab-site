import React, { TextareaHTMLAttributes } from 'react';
import cn from 'classnames';
import { twMerge } from 'tailwind-merge';

export interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  inputClassName?: string;
  label?: string;
  name: string;
  error?: string;
  shadow?: boolean;
  variant?: 'normal' | 'solid' | 'outline';
}

const variantClasses = {
  normal:
    'bg-gray-100 border border-border-base focus:shadow focus:bg-light focus:border-accent',
  solid:
    'bg-gray-100 border border-border-100 focus:bg-light focus:border-accent',
  outline: 'border border-border-base focus:border-accent',
};

const TextArea = React.forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const {
    className,
    label,
    name,
    error,
    variant = 'normal',
    shadow = false,
    inputClassName,
    disabled,
    ...rest
  } = props;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="mb-3 block text-sm font-semibold leading-none text-body-dark"
        >
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        className={twMerge(
          cn(
            'flex w-full appearance-none items-center rounded px-4 py-3 text-sm text-heading transition duration-300 ease-in-out focus:outline-0 focus:ring-0',
            shadow && 'focus:shadow',
            variantClasses[variant],
            disabled && 'cursor-not-allowed bg-gray-100',
            inputClassName,
          ),
        )}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        rows={4}
        ref={ref}
        {...rest}
      />
      {error && <p className="my-2 text-xs text-red-500">{error}</p>}
    </div>
  );
});
TextArea.displayName = 'TextArea';
export default TextArea;

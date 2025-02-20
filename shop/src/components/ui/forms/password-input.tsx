import React, { InputHTMLAttributes, useState } from 'react';
import cn from 'classnames';
import Link from '@/components/ui/link';
import { Eye } from '@/components/icons/eye-icon';
import { EyeOff } from '@/components/icons/eye-off-icon';
import { useTranslation } from 'next-i18next';

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  inputClassName?: string;
  label: string;
  name: string;
  forgotPageLink?: string;
  shadow?: boolean;
  variant?: 'normal' | 'solid' | 'outline';
  error: string | null;
  forgotPageRouteOnClick?: () => void;
}

const variantClasses = {
  normal:
    'bg-gray-100 border border-border-base focus:shadow focus:bg-light focus:border-accent',
  solid:
    'bg-gray-100 border border-border-100 focus:bg-light focus:border-accent',
  outline: 'border border-border-base focus:border-accent',
};

const PasswordInput = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      inputClassName,
      label,
      name,
      error,
      children,
      variant = 'normal',
      shadow = false,
      type = 'text',
      forgotPageLink = '',
      forgotPageRouteOnClick,
      ...rest
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [show, setShow] = useState(false);

    return (
      <div className={className}>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor={name} className="text-sm font-semibold text-body">
            {label}
          </label>

          {forgotPageLink && (
            <Link
              href={forgotPageLink}
              className="text-xs text-accent transition-colors duration-200 hover:text-accent-hover focus:font-semibold focus:text-accent-700 focus:outline-0"
            >
              {t('common:text-forgot-password')}
            </Link>
          )}
          {forgotPageRouteOnClick && (
            <button
              onClick={forgotPageRouteOnClick}
              type="button"
              className="text-xs text-accent transition-colors duration-200 hover:text-accent-hover focus:font-semibold focus:text-accent-700 focus:outline-0"
            >
              {t('common:text-forgot-password')}
            </button>
          )}
        </div>
        <div className="relative">
          <input
            id={name}
            name={name}
            type={show ? 'text' : 'password'}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded py-3 text-sm text-heading transition duration-300 ease-in-out focus:outline-0 focus:ring-0 ltr:pl-4 ltr:pr-11 rtl:pr-4 rtl:pl-11',
              shadow && 'focus:shadow',
              variantClasses[variant],
              inputClassName
            )}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            {...rest}
          />
          <label
            htmlFor={name}
            className="absolute top-5 -mt-2 cursor-pointer text-body ltr:right-4 rtl:left-4"
            onClick={() => setShow((prev) => !prev)}
          >
            {show ? (
              <EyeOff className="h-6 w-6" />
            ) : (
              <Eye className="h-6 w-6" />
            )}
          </label>
        </div>
        {error && <p className="my-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;

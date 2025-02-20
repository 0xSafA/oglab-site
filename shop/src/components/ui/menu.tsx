import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import React, { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

type IProps = {
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  Icon: React.ElementType;
};

const MenuBox = ({
  children,
  className,
  Icon,
  iconClassName,
  ...rest
}: IProps) => {
  return (
    <Menu as="div" className={cn('relative', className)} {...rest}>
      <MenuButton
        className={cn(
          'h-[2.375rem] w-[2.375rem] rounded-full border border-border-200 bg-light p-1 text-xl relative',
          iconClassName,
        )}
      >
        <Icon className="m-auto" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="div"
          className="absolute top-16 z-30 w-80 rounded-lg border border-gray-200 bg-white shadow-box end-2 origin-top-end focus:outline-none sm:top-12 sm:mt-0.5 sm:end-0 lg:top-14 lg:mt-0"
        >
          <Menu.Item>{children}</Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export const MenuButton = ({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Menu.Button className={twMerge(cn(className))} {...rest}>
      {children}
    </Menu.Button>
  );
};

export { MenuBox };

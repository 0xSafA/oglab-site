import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import cn from 'classnames';

const drawerClasses = {
  overlay:
    'fixed inset-0 cursor-pointer bg-black bg-opacity-60 transition-opacity dark:bg-opacity-80',
  placement: {
    top: '-translate-y-full',
    right: 'translate-x-full',
    bottom: 'translate-y-full',
    left: '-translate-x-full',
  },
};

function isPlacementOnYAxis(placement: keyof typeof drawerClasses.placement) {
  return ['top', 'bottom'].indexOf(placement) !== -1;
}

export type DrawerProps = {
  isOpen: boolean;
  onClose(): void;
  placement?: keyof typeof drawerClasses.placement;
  overlayClassName?: string;
  containerClassName?: string;
  className?: string;
};

export function DrawerPortal({
  isOpen,
  onClose,
  placement = 'right',
  overlayClassName,
  containerClassName,
  className,
  children,
}: React.PropsWithChildren<DrawerProps>) {
  const TransitionComponent: React.ElementType = Transition;
  const TransitionChild: React.ElementType = Transition.Child;

  return (
    <TransitionComponent appear show={isOpen} as={Fragment}>
      <Dialog
        as="aside"
        onClose={onClose}
        className={cn('fixed inset-0 z-[999] overflow-hidden', className)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay
            className={cn(drawerClasses.overlay, overlayClassName)}
          />
        </TransitionChild>
        {/*
          -> Please do not remove this Sr Only button.
          -> It's required this button to tackle the HeadlessUI's FocusTap Warnings
        */}
        <button type="button" className="sr-only">
          Sr Only
        </button>

        <TransitionChild
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom={drawerClasses.placement[placement]}
          enterTo={
            isPlacementOnYAxis(placement) ? 'translate-y-0' : 'translate-x-0'
          }
          leave="transform transition ease-in-out duration-300"
          leaveFrom={
            isPlacementOnYAxis(placement) ? 'translate-y-0' : 'translate-x-0'
          }
          leaveTo={drawerClasses.placement[placement]}
        >
          <div
            className={cn(
              'fixed h-full w-full break-words bg-gray-0 shadow-xl',
              placement === 'top' && 'top-0',
              placement === 'right' && 'inset-y-0 right-0',
              placement === 'bottom' && 'bottom-0',
              placement === 'left' && 'inset-y-0 left-0',

              containerClassName,
            )}
          >
            {children}
          </div>
        </TransitionChild>
      </Dialog>
    </TransitionComponent>
  );
}

DrawerPortal.displayName = 'DrawerPortal';

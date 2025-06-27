import { HeartFillIcon } from '@/components/icons/heart-fill';
import { HeartOutlineIcon } from '@/components/icons/heart-outline';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useUser } from '@/framework/user';
import { useInWishlist, useToggleWishlist } from '@/framework/wishlist';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';
import { HeartGhostIcon } from '@/components/icons/heart-ghost';

function FavoriteButton({
  productId,
  className,
  variant = 'default',
}: {
  productId: string;
  className?: string;
  variant?: 'default' | 'minimal';
}) {
  const { isAuthorized } = useUser();
  const { toggleWishlist, isLoading: adding } = useToggleWishlist(productId);
  const { inWishlist, isLoading: checking } = useInWishlist({
    enabled: isAuthorized,
    product_id: productId,
  });

  const { openModal } = useModalAction();
  function toggle() {
    if (!isAuthorized) {
      openModal('LOGIN_VIEW');
      return;
    }
    toggleWishlist({ product_id: productId });
  }
  const isLoading = adding || checking;
  if (isLoading) {
    return (
      <div
        className={twMerge(
          classNames(
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300',
            variant === 'minimal' ? "bg-black bg-opacity-20" : '',
            className
          )
        )}
      >
        <Spinner
          simple={true}
          className={classNames(variant === 'default' ? 'h-5 w-5' : 'h-4 w-4')}
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      className={twMerge(
        classNames(
          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xl text-accent transition-colors',
          inWishlist ? 'border-accent' : 'border-gray-300',
          variant === 'minimal' &&
            (inWishlist
              ? 'bg-accent text-white'
              : 'bg-black bg-opacity-20 text-white'),
          className
        )
      )}
      onClick={toggle}
    >
      <>
        {variant === 'default' ? (
          inWishlist ? (
            <HeartFillIcon />
          ) : (
            <HeartOutlineIcon />
          )
        ) : (
          <HeartGhostIcon />
        )}
      </>
    </button>
  );
}

export default FavoriteButton;

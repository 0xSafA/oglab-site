import { cartAnimation } from '@/lib/cart-animation';
import { useCart } from '@/store/quick-cart/cart.context';
import { generateCartItem } from '@/store/quick-cart/generate-cart-item';
import Link from 'next/link';
import { PlusIconNew } from '@/components/icons/plus-icon';
import { MinusIconNew } from '@/components/icons/minus-icon';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
const AddToCartBtn = dynamic(
  () => import('@/components/products/add-to-cart/add-to-cart-btn'),
  {
    ssr: false,
  }
);
const Counter = dynamic(() => import('@/components/ui/counter'), {
  ssr: false,
});

interface Props {
  data: any;
  variant?:
    | 'helium'
    | 'neon'
    | 'argon'
    | 'oganesson'
    | 'single'
    | 'big'
    | 'text'
    | 'florine';
  counterVariant?:
    | 'helium'
    | 'neon'
    | 'argon'
    | 'oganesson'
    | 'single'
    | 'details'
    | 'florine';
  counterClass?: string;
  variation?: any;
  disabled?: boolean;
}

export const AddToCart = ({
  data,
  variant = 'helium',
  counterVariant,
  counterClass,
  variation,
  disabled,
}: Props) => {
  const { t } = useTranslation('common');
  const {
    addItemToCart,
    removeItemFromCart,
    isInStock,
    getItemFromCart,
    isInCart,
    updateCartLanguage,
    language,
  } = useCart();
  const item = generateCartItem(data, variation);
  const handleAddClick = (
    e: React.MouseEvent<HTMLButtonElement | MouseEvent>
  ) => {
    e.stopPropagation();
    // Check language and update
    if (item?.language !== language) {
      updateCartLanguage(item?.language);
    }
    addItemToCart(item, 1);
    if (!isInCart(item.id)) {
      cartAnimation(e);
    }
  };
  const handleRemoveClick = (e: any) => {
    e.stopPropagation();
    removeItemFromCart(item.id);
  };
  const outOfStock = isInCart(item?.id) && !isInStock(item.id);
  const disabledState =
    disabled || outOfStock || data.status.toLowerCase() != 'publish';

  return !isInCart(item?.id) ? (
    <div>
      {!data?.is_external || !data?.external_product_url ? (
        variant !== 'florine' ? (
          <AddToCartBtn
            disabled={disabledState}
            variant={variant}
            onClick={handleAddClick}
          />
        ) : (
          <div className="flex w-24 items-center justify-between rounded-[0.25rem] border border-[#dbdbdb]">
            <button
              className={classNames(
                'p-2 text-base',
                disabledState || !isInCart(item?.id)
                  ? 'cursor-not-allowed text-[#c1c1c1]'
                  : 'text-accent'
              )}
              disabled={disabledState || !isInCart(item?.id)}
              onClick={handleRemoveClick}
            >
              <span className="sr-only">{t('text-minus')}</span>
              <MinusIconNew />
            </button>
            <div className="text-sm uppercase text-[#666]">Add</div>
            <button
              className={classNames(
                'p-2 text-base',
                disabledState
                  ? 'cursor-not-allowed text-[#c1c1c1]'
                  : 'text-accent'
              )}
              disabled={disabledState}
              onClick={handleAddClick}
            >
              <span className="sr-only">{t('text-plus')}</span>
              <PlusIconNew />
            </button>
          </div>
        )
      ) : (
        <Link
          href={data?.external_product_url}
          target="_blank"
          className="inline-flex h-10 !shrink items-center justify-center rounded border border-transparent bg-accent px-5 py-0 text-sm font-semibold leading-none text-light outline-none transition duration-300 ease-in-out hover:bg-accent-hover focus:shadow focus:outline-0 focus:ring-1 focus:ring-accent-700"
        >
          {data?.external_product_button_text}
        </Link>
      )}
    </div>
  ) : (
    <>
      <Counter
        value={getItemFromCart(item.id).quantity}
        onDecrement={handleRemoveClick}
        onIncrement={handleAddClick}
        variant={counterVariant || variant}
        className={counterClass}
        disabled={outOfStock}
      />
    </>
  );
};

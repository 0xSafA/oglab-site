import Counter from '@/components/ui/counter';
import { cartAnimation } from '@/lib/cart-animation';
import { useCart } from '@/store/quick-cart/cart.context';
import { generateCartItem } from '@/store/quick-cart/generate-cart-item';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Props {
  data: any;
  variant?:
    | 'helium'
    | 'neon'
    | 'argon'
    | 'oganesson'
    | 'single'
    | 'big'
    | 'bordered';
  counterVariant?:
    | 'helium'
    | 'neon'
    | 'argon'
    | 'oganesson'
    | 'single'
    | 'details'
    | 'bordered';
  counterClass?: string;
  variation?: any;
  disabled?: boolean;
}

export const AddToCartExternal = ({
  data,
  variant = 'helium',
  counterVariant,
  counterClass,
  variation,
  disabled,
}: Props) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { addItemToCart, isInStock, isInCart, updateCartLanguage, language } =
    useCart();
  const item = generateCartItem(data, variation);
  const [quantity, setQuantity] = useState<number>(1);


  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <Link href={data?.external_product_url} target="_blank" className='inline-flex items-center justify-center font-semibold leading-none rounded outline-none transition duration-300 ease-in-out focus:outline-0 focus:shadow focus:ring-1 focus:ring-accent-700 bg-accent text-light border border-transparent hover:bg-accent-hover px-5 py-0 h-10 w-full max-w-sm !shrink'>
        {data?.external_product_button_text}
      </Link>
    </div>
  );
};

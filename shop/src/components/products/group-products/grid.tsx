import { Image } from '@/components/ui/image';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { isEven } from '@/lib/is-even';
import { productPlaceholder } from '@/lib/placeholders';
import { Product } from '@/types';

const GroupProductsGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid w-full gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {products?.map((product, idx) => {
        return (
          <Link
            href={Routes.product(product?.slug)}
            className="relative grid w-full bg-gray-100 lg:even:col-span-2"
            key={product?.id}
          >
            <Image
              src={product?.image?.original ?? productPlaceholder}
              alt={product?.name}
              width={isEven(idx) ? 960 : 1560}
              height={960}
              className="h-[43.75rem] rounded-lg lg:rounded-2xl"
            />
          </Link>
        );
      })}
    </div>
  );
};

export default GroupProductsGrid;

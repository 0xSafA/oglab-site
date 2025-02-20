import { FlashSale } from '@/types';
import FlashSaleItem from '@/components/flash-sale/flash-sale-card';

interface FlashSaleCardProps {
  flashSales: FlashSale[];
  className?: string;
};

const FlashSaleCard: React.FC<FlashSaleCardProps> = ({
  flashSales,
  className,
}): JSX.Element[] => {
  return flashSales?.map((flashSale) => (
    <FlashSaleItem
      flashSale={flashSale as FlashSale}
      key={flashSale?.id}
      className={className}
    />
  ));
};

export default FlashSaleCard;

interface ItemInfoRowProps {
  title: string;
  value: string;
}
export const ItemInfoRow: React.FC<ItemInfoRowProps> = ({ title, value }) => (
  <div className="flex justify-between">
    <p className="text-sm text-body">{title}</p>
    <span className="text-sm text-body ltr:text-right rtl:text-left">
      {value}
    </span>
  </div>
);

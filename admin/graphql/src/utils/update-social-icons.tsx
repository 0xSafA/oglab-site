import { socialIcon } from '@/utils/constants';
import * as socialIcons from '@/components/icons/social';
import { getIcon } from '@/utils/get-icon';

export const updatedIcons = socialIcon?.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex h-4 w-4 items-center justify-center">
        {getIcon({
          iconList: socialIcons,
          iconName: item?.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

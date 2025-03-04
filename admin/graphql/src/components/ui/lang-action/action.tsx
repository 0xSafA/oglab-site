import ActionButtons from '@/components/common/action-buttons';
import { Config } from '@/config';
import LanguageAction from './language-switcher';
import { useRouter } from 'next/router';

export type LanguageSwitcherProps = {
  record: any;
  slug: string;
  deleteModalView?: string | any;
  routes: any;
  className?: string | undefined;
  enablePreviewMode?: boolean;
  isShop?: boolean;
  shopSlug?: string;
  couponApproveButton?: boolean;
  isCouponApprove?: boolean;
};

export default function LanguageSwitcher({
  record,
  slug,
  deleteModalView,
  routes,
  className,
  enablePreviewMode,
  isShop,
  shopSlug,
  couponApproveButton,
  isCouponApprove,
}: LanguageSwitcherProps) {
  const { enableMultiLang } = Config;
  const {
    query: { shop },
  } = useRouter();

  const preview = `${process.env.NEXT_PUBLIC_SHOP_URL}/products/preview/${slug}`;
  console.log(slug, 'fsdf sdf ');

  return (
    <>
      {enableMultiLang ? (
        <LanguageAction
          slug={slug}
          record={record}
          deleteModalView={deleteModalView}
          routes={routes}
          className={className}
          enablePreviewMode={enablePreviewMode}
          isShop={isShop}
          shopSlug={shopSlug}
          couponApproveButton={couponApproveButton}
          isCouponApprove={isCouponApprove}
        />
      ) : (
        <ActionButtons
          id={record?.id}
          editUrl={routes.editWithoutLang(slug, shop)}
          previewUrl={preview}
          enablePreviewMode={enablePreviewMode}
          deleteModalView={deleteModalView}
          couponApproveButton={couponApproveButton}
          isCouponApprove={isCouponApprove}
        />
      )}
    </>
  );
}

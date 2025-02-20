import Select from '@/components/ui/select/select';
import { useShopsQuery } from '@/graphql/shops.graphql';
// import { useAdminsQuery } from '@/graphql/user.graphql';
import { MessageAvatarPlaceholderIcon } from '@/components/icons/message-avatar-placeholder-icon';
import { useState } from 'react';
import { SortOrder, Shop } from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { useCreateConversation } from '@/components/message/data/conversations';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import isEmpty from 'lodash/isEmpty';
import Image from 'next/image';
import { useForm } from 'react-hook-form';

type FormatOptionLabelProps = {
  name: string;
  logo: {
    thumbnail: string;
  };
};

const formatOptionLabel = ({ logo, name }: FormatOptionLabelProps) => (
  <div className="flex items-center">
    <div className="relative mr-3 h-6 w-6 shrink-0 overflow-hidden rounded-full">
      {!isEmpty(logo?.thumbnail) ? (
        <Image
          src={logo?.thumbnail}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw"
          className="product-image object-contain"
        />
      ) : (
        <MessageAvatarPlaceholderIcon
          className="text-[1.5rem]"
          color="#DDDDDD"
        />
      )}
    </div>
    <div className="truncate">{name}</div>
  </div>
);

const ComposeMessageModal = () => {
  const [shop, setShop] = useState(null);
  const [active, setIsActive] = useState<boolean>(Boolean(0));
  const { t } = useTranslation();

  let options = {
    limit: 1000,
    page: 1,
    orderBy: 'created_at',
    sortedBy: SortOrder.Desc as SortOrder,
  };

  let { data: shops, loading, error } = useShopsQuery({ variables: options });
  const { createConversation, isLoading: creating } = useCreateConversation();

  const { handleSubmit } = useForm();

  if (error) return <ErrorMessage message={error?.message} />;

  const onTypeFilter = (shop: Shop[] | undefined) => {
    // @ts-ignore
    setShop(shop?.id);
    // @ts-ignore
    setIsActive(shop?.is_active);
  };
  async function onSubmit() {
    if (shop || !Boolean(active)) {
      createConversation({
        variables: {
          input: {
            // @ts-ignore
            shop_id: shop,
          },
        },
      });
    }
  }
  return (
    <div className="m-auto block max-w-lg rounded bg-light p-6 md:w-[32.5rem]">
      <h2 className="mb-6 text-base font-medium">{t('text-starting-chat')}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Select
          options={shops?.shops?.data}
          isLoading={loading}
          getOptionLabel={(option: any) => option.name}
          getOptionValue={(option: any) => option.slug}
          placeholder="Find Vendor"
          onChange={onTypeFilter as any}
          isClearable={true}
          // @ts-ignore
          formatOptionLabel={formatOptionLabel}
        />
        <div className="mt-6 text-right">
          <Button
            className="px-4 text-base"
            loading={creating}
            disabled={!!creating || !shop || !Boolean(active)}
          >
            {t('text-start-conversation')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMessageModal;

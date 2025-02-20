import { useEffect } from 'react';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useDefaultPaymentMethod } from '@/framework/card';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import {
  offset,
  flip,
  autoUpdate,
  useFloating,
  shift,
} from '@floating-ui/react';
import PopOver from '@/components/ui/popover';

interface ActionProps {
  card: any;
  payments: string[];
}

const Action = ({ card = {}, payments = [] }: ActionProps) => {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const { createDefaultPaymentMethod, isLoading: cardLoading } =
    useDefaultPaymentMethod();

  function deleteCard(id: string) {
    openModal('DELETE_CARD_MODAL', {
      card_id: id,
    });
  }

  const makeDefaultCard = async (id: string) => {
    await createDefaultPaymentMethod({
      method_id: id,
    });
  };
  const { update, refs } = useFloating({
    strategy: 'fixed',
    placement: 'bottom',
    middleware: [offset(0), flip(), shift()],
  });

  // This one is for recalculating the position of the floating element if no space is left on the given placement
  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) {
      return;
    }
    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [refs.reference, refs.floating, update]);

  return (
    <>
      {!card?.default_card ? (
        <PopOver>
          <Button
            className="!h-auto w-full !justify-start px-2 !py-2.5 text-sm leading-6 hover:bg-gray-50 hover:text-accent focus:!shadow-none focus:!ring-0"
            onClick={() => makeDefaultCard(card?.id)}
            variant="custom"
            disabled={cardLoading}
          >
            {t('text-set-as-default')}
          </Button>

          <Button
            variant="custom"
            onClick={() => deleteCard(card?.id)}
            className="!h-auto w-full !justify-start px-2 !py-2.5 text-sm leading-6 text-[#F83D3D] hover:bg-gray-50 hover:text-[#d03131] focus:!shadow-none focus:!ring-0"
          >
            {t('text-delete')}
          </Button>
        </PopOver>
      ) : (
        ''
      )}
      {payments?.length <= 1 ? (
        <PopOver>
          <Button
            variant="custom"
            onClick={() => deleteCard(card?.id)}
            className="!h-auto w-full !justify-start px-2 !py-1 text-sm leading-6 text-[#F83D3D] hover:bg-gray-50 hover:text-[#d03131] focus:!shadow-none focus:!ring-0"
          >
            {t('text-delete')}
          </Button>
        </PopOver>
      ) : (
        ''
      )}
    </>
  );
};

export default Action;

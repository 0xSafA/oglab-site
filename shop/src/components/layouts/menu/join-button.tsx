import Button from '@/components/ui/button';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { ButtonProps } from '@/types';
import { useTranslation } from 'next-i18next';

export default function JoinButton({
  title = 'join-button',
  size = 'small',
  className = 'font-semibold',
}: Pick<ButtonProps, 'title' | 'size' | 'className'>) {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  function handleJoin() {
    return openModal('LOGIN_VIEW');
  }
  return (
    <Button className={className} size={size} onClick={handleJoin}>
      {t(title)}
    </Button>
  );
}

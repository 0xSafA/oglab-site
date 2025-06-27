import Button from '@/components/ui/button';
import Card from '@/components/ui/cards/card';
import Input from '@/components/ui/forms/input';
import { useTranslation } from 'next-i18next';
import pick from 'lodash/pick';
import { Form } from '@/components/ui/forms/form';
import { useUpdateEmail } from '@/framework/user';
import type { UpdateEmailUserInput, User } from '@/types';

const ProfileUpdateEmail = ({ user }: { user: User }) => {
  const { t } = useTranslation('common');
  const { mutate: updateEmail, isLoading } = useUpdateEmail();

  function onSubmit(values: UpdateEmailUserInput) {
    if (!user) {
      return;
    }
    updateEmail({
      email: values?.email,
    });
  }

  return (
    <Form<UpdateEmailUserInput>
      onSubmit={onSubmit}
      useFormProps={{
        ...(user && {
          defaultValues: pick(user, ['email']),
        }),
      }}
    >
      {({ register }) => (
        <>
          <Card className="mb-8 w-full">
            <div className="mb-6 flex flex-row">
              <Input
                className="flex-1"
                label={t('text-email')}
                {...register('email')}
                variant="outline"
                disabled={!!isLoading}
              />
            </div>

            <div className="flex">
              <Button
                className="ltr:ml-auto rtl:mr-auto"
                loading={isLoading}
                disabled={isLoading}
              >
                {t('text-update')}
              </Button>
            </div>
          </Card>
        </>
      )}
    </Form>
  );
};

export default ProfileUpdateEmail;

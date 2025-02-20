import Button from '@/components/ui/button';

import AuthPageLayout from '@/components/layouts/auth-layout';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';

import {
  useLogoutMutation,
  useResendVerificationEmailMutation,
} from '@/graphql/auth.graphql';
import { useMeQuery } from '@/graphql/me.graphql';
import { getEmailVerified } from '@/utils/auth-utils';
import { AUTH_CRED } from '@/utils/constants';
import Cookies from 'js-cookie';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { toast } from 'react-toastify';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common', 'form'])),
  },
});

export default function VerifyEmailActions() {
  const { t } = useTranslation('common');
  useMeQuery({
    onCompleted: () => {
      router.push(Routes.dashboard);
    },
  });

  const [signOut, { loading: signOutLoading }] = useLogoutMutation({
    onCompleted: () => {
      Cookies.remove(AUTH_CRED);
      toast.success(t('common:successfully-logout'));
      router.push(Routes.login);
    },
    onError: () =>
      toast.error(t('common:PICKBAZAR_MESSAGE.SOMETHING_WENT_WRONG')),
  });
  const router = useRouter();
  const [resend, { loading: resendLoading }] =
    useResendVerificationEmailMutation({
      onCompleted: () =>
        toast.success(t('common:PICKBAZAR_MESSAGE.EMAIL_SENT_SUCCESSFUL')),
      onError: () => toast.error(t('common:SOMETHING_WENT_WRONG')),
    });
  const { emailVerified } = getEmailVerified();
  if (emailVerified) {
    router.push(Routes.dashboard);
  }

  return (
    <>
      <AuthPageLayout>
        <h3 className="mb-6 mt-4 text-center text-base italic text-red-500 text-body">
          {t('common:email-not-verified')}
        </h3>
        <div className="w-full space-y-3">
          <Button
            onClick={() => resend()}
            disabled={emailVerified || resendLoading}
            className="w-full"
          >
            {t('common:resend-verification-email')}
          </Button>
          <Button
            type="button"
            className="w-full"
            disabled={signOutLoading}
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </div>
      </AuthPageLayout>
    </>
  );
}

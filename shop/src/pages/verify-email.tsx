import {
  useLogout,
  useResendVerificationEmail,
  useUser,
} from '@/framework/user';
import Button from '@/components/ui/button';
import Card from '@/components/ui/cards/card';
import { useTranslation } from 'next-i18next';
import Logo from '@/components/ui/logo';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';

export { getStaticProps } from '@/framework/general.ssr';

const VerifyEmail = () => {
  const { getEmailVerified } = useToken();
  const router = useRouter();
  const { emailVerified } = getEmailVerified();
  const { mutate: logout, isLoading: isLogoutLoader } = useLogout();
  useUser();

  if (emailVerified) {
    router.push('/profile');
  }
  const handleLogout = () => {
    logout();
    router.push(Routes.home);
  };

  const { t } = useTranslation('common');
  const { mutate: verifyEmail, isLoading: isVerifying } =
    useResendVerificationEmail();

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[#F4F6F7] py-5 px-4 md:py-8">
      <div className="max-w-[36rem]">
        <Card className="text-center !shadow-900 md:px-[4.375rem] md:py-[2.875rem]">
          <Logo />

          <h2 className="mb-5 mt-2 text-2xl font-semibold">
            {t('common:email-not-verified')}
          </h2>

          <p className="mb-16 text-lg text-[#969FAF]">
            {t('email-not-description')}
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => verifyEmail()}
              disabled={isVerifying || !!isLogoutLoader}
              loading={isVerifying}
              className="!h-13 w-full hover:bg-accent-hover"
            >
              {t('resend-verification-button-text')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="!h-13 w-full"
              onClick={() => handleLogout()}
              disabled={!!isVerifying || isLogoutLoader}
              loading={isLogoutLoader}
            >
              {t('auth-menu-logout')}
            </Button>
          </div>
          <div className="mt-4">
            <Link
              href={Routes.home}
              className="inline-flex items-center text-bolder underline hover:text-body-dark hover:no-underline focus:outline-none sm:text-base"
            >
              {t('404-back-home')}
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};
VerifyEmail.authenticationRequired = true;
export default VerifyEmail;

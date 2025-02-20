import { useRouter } from 'next/router';
import { BackArrowRound } from '@/components/icons/back-arrow-round';
import { useUser } from '@/framework/user';
import LoginView from '@/components/auth/login-form';
import { useToken } from '@/lib/hooks/use-token';
import VerifyEmail from '@/pages/verify-email';

import dynamic from 'next/dynamic';
import { useHasMounted } from '@/lib/use-has-mounted';
import axios from 'axios';
import { useSettings } from '@/framework/settings';
import { Routes } from '@/config/routes';
import NotFound from '@/components/404/404';
const Loader = dynamic(
  () => import('@/components/ui/loaders/spinner/spinner'),
  { ssr: false }
);

const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { getEmailVerified, setEmailVerified } = useToken();
  const router = useRouter();
  const { me, isAuthorized, error } = useUser();
  const { settings } = useSettings();
  const hasMounted = useHasMounted();
  const isUser = !!me;

  if (axios.isAxiosError(error)) {
    if (error?.response?.status === 417) {
      return (
        <NotFound
          title={`${settings?.siteTitle} ${process.env.NEXT_PUBLIC_VERSION}`}
          subTitle={`This copy of ${settings?.siteTitle} is not genuine.`}
          linkTitle="Please contact with site admin."
          link={Routes.contactUs}
        />
      );
    }
  }

  const { emailVerified } = getEmailVerified();
  if (!isUser && !isAuthorized && hasMounted) {
    return (
      <div className="relative flex min-h-screen w-full justify-center py-5 md:py-8">
        <button
          className="absolute top-5 flex h-8 w-8 items-center justify-center text-gray-200 transition-colors hover:text-gray-400 ltr:left-5 rtl:right-5 md:top-1/2 md:-mt-8 md:h-16 md:w-16 md:text-gray-300 ltr:md:left-10 rtl:md:right-10"
          onClick={router.back}
        >
          <BackArrowRound />
        </button>
        <div className="my-auto flex flex-col">
          <LoginView />
        </div>
      </div>
    );
  }

  if (isAuthorized && emailVerified === false) {
    return <VerifyEmail />;
  }
  if (isUser && isAuthorized) {
    return <div>{children}</div>;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <Loader showText={false} />;
};

export default PrivateRoute;

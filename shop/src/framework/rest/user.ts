import {
  initialState,
  updateFormState,
} from '@/components/auth/forgot-password';
import { initialOtpState, optAtom } from '@/components/otp/atom';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Routes } from '@/config/routes';
import client from '@/framework/client';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import { setAuthCredentials } from '@/framework/utils/auth-utils';
import { AUTH_CRED } from '@/framework/utils/constants';
import {
  NEWSLETTER_POPUP_MODAL_KEY,
  REVIEW_POPUP_MODAL_KEY,
} from '@/lib/constants';
import { useToken } from '@/lib/hooks/use-token';
import { authorizationAtom } from '@/store/authorization-atom';
import { clearCheckoutAtom } from '@/store/checkout';
import type {
  ChangePasswordUserInput,
  OtpLoginInputType,
  RegisterUserInput,
} from '@/types';
import axios from 'axios';
import { useAtom } from 'jotai';
import Cookies from 'js-cookie';
import { useStateMachine } from 'little-state-machine';
import { signOut as socialLoginSignOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { toast } from 'react-toastify';

export function useUser() {
  const [isAuthorized] = useAtom(authorizationAtom);
  const { setEmailVerified, getEmailVerified } = useToken();
  const { emailVerified } = getEmailVerified();
  const router = useRouter();

  const { data, isLoading, error, isFetchedAfterMount } = useQuery(
    [API_ENDPOINTS.USERS_ME],
    client.users.me,
    {
      enabled: isAuthorized,
      retry: false,
      onSuccess: (data) => {
        if (emailVerified === false) {
          setEmailVerified(true);
          router.reload();
          return;
        }
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          if (err?.response?.status === 409) {
            setEmailVerified(false);
            router.push(Routes.verifyEmail);
            return;
          }
          if (router.pathname === Routes.verifyEmail) {
            return;
          }
        }
      },
    },
  );
  //TODO: do some improvement here
  return {
    me: data,
    isLoading,
    error,
    isAuthorized,
    isFetchedAfterMount,
  };
}

export const useDeleteAddress = () => {
  const { closeModal } = useModalAction();
  const queryClient = useQueryClient();
  return useMutation(client.users.deleteAddress, {
    onSuccess: (data) => {
      if (data) {
        toast.success('successfully-address-deleted');
        closeModal();
        return;
      }
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};

      toast.error(data?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS_ME);
    },
  });
};
export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation(client.users.updateEmail, {
    onSuccess: (data) => {
      if (data) {
        toast.success(t('successfully-email-updated'));
      }
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};

      toast.error(data?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS_ME);
    },
  });
};

export const useUpdateUser = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { closeModal } = useModalAction();
  return useMutation(client.users.update, {
    onSuccess: (data) => {
      if (data?.id) {
        toast.success(`${t('profile-update-successful')}`);
        closeModal();
      }
    },
    onError: (error) => {
      toast.error(`${t('error-something-wrong')}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS_ME);
    },
  });
};

export const useContact = ({ reset }: { reset: () => void }) => {
  const { t } = useTranslation('common');

  return useMutation(client.users.contactUs, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${t(data.message)}`);
        reset();
      } else {
        toast.error(`${t(data.message)}`);
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export function useLogin() {
  const { t } = useTranslation('common');
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal } = useModalAction();
  const { setToken } = useToken();
  const queryClient = useQueryClient();
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isLoading } = useMutation(client.users.login, {
    onSuccess: (data) => {
      if (!data.token) {
        setServerError('error-credential-wrong');
        return;
      }
      setToken(data.token);
      setAuthCredentials(data.token, data.permissions);
      setAuthorized(true);
      closeModal();
    },
    onError: (error: Error) => {
      console.log(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.NOTIFY_LOGS);
    },
  });

  return { mutate, isLoading, serverError, setServerError };
}

export function useSocialLogin() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { setToken } = useToken();
  const [_, setAuthorized] = useAtom(authorizationAtom);

  return useMutation(client.users.socialLogin, {
    onSuccess: (data) => {
      if (data?.token && data?.permissions?.length) {
        setToken(data?.token);
        setAuthorized(true);
        return;
      }
      if (!data.token) {
        toast.error(`${t('error-credential-wrong')}`);
      }
    },
    onError: (error: Error) => {
      console.log(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.NOTIFY_LOGS);
      queryClient.clear();
    },
  });
}

export function useSendOtpCode({
  verifyOnly,
}: Partial<{ verifyOnly: boolean }> = {}) {
  let [serverError, setServerError] = useState<string | null>(null);
  const [otpState, setOtpState] = useAtom(optAtom);

  const { mutate, isLoading } = useMutation(client.users.sendOtpCode, {
    onSuccess: (data) => {
      if (!data.success) {
        setServerError(data.message!);
        return;
      }
      setOtpState({
        ...otpState,
        otpId: data?.id!,
        isContactExist: data?.is_contact_exist!,
        phoneNumber: data?.phone_number!,
        step: data?.is_contact_exist! ? 'OtpForm' : 'RegisterForm',
        ...(verifyOnly && { step: 'OtpForm' }),
      });
    },
    onError: (error: Error) => {
      console.log(error.message);
    },
  });

  return { mutate, isLoading, serverError, setServerError };
}

export function useVerifyOtpCode({
  onVerifySuccess,
}: {
  onVerifySuccess: Function;
}) {
  const [otpState, setOtpState] = useAtom(optAtom);
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate, isLoading } = useMutation(client.users.verifyOtpCode, {
    onSuccess: (data) => {
      if (!data.success) {
        setServerError(data?.message!);
        return;
      }
      if (onVerifySuccess) {
        onVerifySuccess({
          phone_number: otpState.phoneNumber,
        });
      }
      setOtpState({
        ...initialOtpState,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { mutate, isLoading, serverError, setServerError };
}

export function useOtpLogin() {
  const [otpState, setOtpState] = useAtom(optAtom);
  const { t } = useTranslation('common');
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal } = useModalAction();
  const { setToken } = useToken();
  const queryClient = new QueryClient();
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate: otpLogin, isLoading } = useMutation(client.users.OtpLogin, {
    onSuccess: (data) => {
      if (!data.token) {
        setServerError('text-otp-verify-failed');
        return;
      }
      setToken(data.token!);
      setAuthorized(true);
      setOtpState({
        ...initialOtpState,
      });
      closeModal();
    },
    onError: (error: Error) => {
      console.log(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.NOTIFY_LOGS);
      queryClient.clear();
    },
  });

  function handleSubmit(input: OtpLoginInputType) {
    otpLogin({
      ...input,
      phone_number: otpState.phoneNumber,
      otp_id: otpState.otpId!,
    });
  }

  return { mutate: handleSubmit, isLoading, serverError, setServerError };
}

export function useRegister() {
  const { t } = useTranslation('common');
  const { setToken } = useToken();
  const queryClient = useQueryClient();
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const { closeModal } = useModalAction();
  let [formError, setFormError] = useState<Partial<RegisterUserInput> | null>(
    null,
  );

  const { mutate, isLoading } = useMutation(client.users.register, {
    onSuccess: (data) => {
      if (data?.token && data?.permissions?.length) {
        setToken(data?.token);
        setAuthorized(true);
        closeModal();
        return;
      }
      if (!data.token) {
        toast.error(`${t('error-credential-wrong')}`);
      }
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};

      setFormError(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.NOTIFY_LOGS);
    },
  });

  return { mutate, isLoading, formError, setFormError };
}
export function useResendVerificationEmail() {
  const { t } = useTranslation('common');
  const { mutate, isLoading } = useMutation(
    client.users.resendVerificationEmail,
    {
      onSuccess: (data) => {
        if (data?.success) {
          toast.success(t('PICKBAZAR_MESSAGE.EMAIL_SENT_SUCCESSFUL'));
        }
      },
      onError: (error) => {
        const {
          response: { data },
        }: any = error ?? {};

        toast.error(data?.message);
      },
    },
  );

  return { mutate, isLoading };
}
export function useLogout() {
  const queryClient = useQueryClient();
  const { removeToken } = useToken();
  const [_, setAuthorized] = useAtom(authorizationAtom);
  const [_r, resetCheckout] = useAtom(clearCheckoutAtom);

  const { mutate: signOut, isLoading } = useMutation(client.users.logout, {
    onSuccess: (data) => {
      if (data) {
        removeToken();
        Cookies.remove(AUTH_CRED);
        Cookies.remove(REVIEW_POPUP_MODAL_KEY);
        Cookies.remove(NEWSLETTER_POPUP_MODAL_KEY);
        setAuthorized(false);
        //@ts-ignore
        resetCheckout();
        queryClient.refetchQueries(API_ENDPOINTS.USERS_ME);
      }
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
  function handleLogout() {
    socialLoginSignOut({ redirect: false });
    signOut();
  }
  return {
    mutate: handleLogout,
    isLoading,
  };
}

export function useChangePassword() {
  const { t } = useTranslation('common');
  let [formError, setFormError] =
    useState<Partial<ChangePasswordUserInput> | null>(null);

  const { mutate, isLoading } = useMutation(client.users.changePassword, {
    onSuccess: (data) => {
      if (!data.success) {
        setFormError({
          oldPassword: data?.message ?? '',
        });
        return;
      }
      toast.success(`${t('password-successful')}`);
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};
      setFormError(data);
    },
  });

  return { mutate, isLoading, formError, setFormError };
}

export function useForgotPassword() {
  const { actions } = useStateMachine({ updateFormState });
  let [message, setMessage] = useState<string | null>(null);
  let [formError, setFormError] = useState<any>(null);
  const { t } = useTranslation();

  const { mutate, isLoading } = useMutation(client.users.forgotPassword, {
    onSuccess: (data, variables) => {
      if (!data.success) {
        setFormError({
          email: data?.message ?? '',
        });
        return;
      }
      setMessage(data?.message!);
      actions.updateFormState({
        email: variables.email,
        step: 'Token',
      });
    },
  });

  return { mutate, isLoading, message, formError, setFormError, setMessage };
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  const { openModal } = useModalAction();
  const { actions } = useStateMachine({ updateFormState });

  return useMutation(client.users.resetPassword, {
    onSuccess: (data) => {
      if (data?.success) {
        toast.success('Successfully Reset Password!');
        actions.updateFormState({
          ...initialState,
        });
        openModal('LOGIN_VIEW');
        return;
      }
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useVerifyForgotPasswordToken() {
  const { actions } = useStateMachine({ updateFormState });
  const queryClient = useQueryClient();
  let [formError, setFormError] = useState<any>(null);

  const { mutate, isLoading } = useMutation(
    client.users.verifyForgotPasswordToken,
    {
      onSuccess: (data, variables) => {
        if (!data.success) {
          setFormError({
            token: data?.message ?? '',
          });
          return;
        }
        actions.updateFormState({
          step: 'Password',
          token: variables.token as string,
        });
      },
      onSettled: () => {
        queryClient.clear();
      },
    },
  );

  return { mutate, isLoading, formError, setFormError };
}

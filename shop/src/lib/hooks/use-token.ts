import Cookies from 'js-cookie';
import { AUTH_TOKEN_KEY, EMAIL_VERIFIED } from '@/lib/constants';
export function useToken() {
  return {
    setToken(token: string) {
      Cookies.set(AUTH_TOKEN_KEY, token, { expires: 1 });
    },
    getToken() {
      return Cookies.get(AUTH_TOKEN_KEY);
    },
    removeToken() {
      Cookies.remove(AUTH_TOKEN_KEY);
    },
    hasToken() {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (!token) return false;
      return true;
    },
    setEmailVerified(emailVerified: boolean | null) {
      Cookies.set(EMAIL_VERIFIED, JSON.stringify({ emailVerified }));
    },
    getEmailVerified() {
      const emailVerified = Cookies.get(EMAIL_VERIFIED);
      return emailVerified ? JSON.parse(emailVerified) : true;
    },
  };
}

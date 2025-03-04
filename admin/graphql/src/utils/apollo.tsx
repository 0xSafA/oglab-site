import { Routes } from '@/config/routes';
import {
  ApolloClient,
  from,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import deepMerge from 'deepmerge';
import Cookies from 'js-cookie';
import isEqual from 'lodash/isEqual';
import Router from 'next/router';
import { useMemo } from 'react';
import { getAuthCredentials, setEmailVerified } from './auth-utils';
import { createUploadLink } from 'apollo-upload-client';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

function mergePagination(existing: any, incoming: any) {
  return existing
    ? { ...incoming, data: [...existing.data, ...incoming.data] }
    : incoming;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient() {
  const authLink = setContext((_, { headers }) => {
    const { token } = getAuthCredentials();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) => {
        if (message === 'PICKBAZAR_ERROR.NOT_AUTHORIZED') {
          Cookies.remove('AUTH_CRED');
          Router.push(Routes.login);
        }
        if (message === 'EMAIL_NOT_VERIFIED') {
          setEmailVerified(false);
          Router.push(Routes.verifyEmail);
        }
        if (message === 'INVALID_LICENSE_KEY') {
          setEmailVerified(false);
          Router.push(Routes.verifyLicense);
        }
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        );
      });
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });
  const httpLink = createUploadLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT, // Server URL (must be absolute)
    credentials: 'same-origin',
  });

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    //@ts-ignore
    link: from([authLink, errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            conversations: {
              keyArgs: ['search', 'sortedBy', 'orderBy'],
              merge: mergePagination,
            },
            messages: {
              keyArgs: ['conversation_id'],
              merge: mergePagination,
            },
          },
        },
      },
    }),
  });
}

export function initializeApollo(initialState: any = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = deepMerge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s)),
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client: any, pageProps: any) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: any) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  return useMemo(() => initializeApollo(state), [state]);
}

/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { createSyncChannels } from '@commercetools/sync-actions';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import type {
  TFetchReviewsQuery,
  TFetchReviewsQueryVariables,
  TFetchReviewDetailsQuery,
  TFetchReviewDetailsQueryVariables,
  TUpdateReviewDetailsMutation,
  TUpdateReviewDetailsMutationVariables,
  TFetchChannelsQuery,
  TFetchChannelsQueryVariables,
  TFetchChannelDetailsQuery,
  TFetchChannelDetailsQueryVariables,
  TUpdateChannelDetailsMutation,
  TUpdateChannelDetailsMutationVariables,
} from '../../types/generated/ctp';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
  convertToActionData,
} from '../../helpers';
import FetchReviews from './fetch-reviews.ctp.graphql';
import FetchReviewDetailsQuery from './fetch-review-details.ctp.graphql';
import UpdateReviewDetailsMutation from './update-reiview-details.ctp.graphql';


const syncChannels = createSyncChannels();

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};

type TUseReviewsFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps
) => {
  reviewsPaginatedResult?: TFetchReviewsQuery['reviews'];
  error?: ApolloError;
  loading: boolean;
};

export const useReviewsFetcher: TUseReviewsFetcher = ({
  page,
  perPage,
  tableSorting,
}) => {
  const { data, error, loading } = useMcQuery<
    TFetchReviewsQuery,
    TFetchReviewsQueryVariables
  >(FetchReviews, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    reviewsPaginatedResult: data?.reviews,
    error,
    loading,
  };
};

type TUseReviewDetailsFetcher = (reviewId: string) => {
  review?: TFetchReviewDetailsQuery['review'];
  error?: ApolloError;
  loading: boolean;
};

export const useReviewDetailsFetcher: TUseReviewDetailsFetcher = (
  reviewId
) => {
  const { data, error, loading } = useMcQuery<
    TFetchReviewDetailsQuery,
    TFetchReviewDetailsQueryVariables
  >(FetchReviewDetailsQuery, {
    variables: {
      reviewId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  console.log('data review: '+ JSON.stringify(data));
  return {
    review: data?.review,
    error,
    loading,
  };
};

export const useReviewDetailsUpdater = () => {
  const [updateReviewDetails, { loading }] = useMcMutation<
    TUpdateReviewDetailsMutation,
    TUpdateReviewDetailsMutationVariables
  >(UpdateReviewDetailsMutation);

  const execute = async ({
    originalDraft,
    nextDraft,
  }: {
    originalDraft: NonNullable<TFetchReviewDetailsQuery['review']>;
    nextDraft: unknown;
  }) => {
    // const actions = syncChannels.buildActions(
    //   nextDraft,
    //   originalDraft
    // );
    try {
      return await updateReviewDetails({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          reviewId: originalDraft.id,
          version: originalDraft.version,
          actions: {transitionState: {state: {key: nextDraft.state}}},
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

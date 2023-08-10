import { useIntl } from 'react-intl';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useReviewsFetcher } from '../../hooks/use-reviews-connector';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { getErrorMessage } from '../../helpers';
import Text from '@commercetools-uikit/text';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import FlatButton from '@commercetools-uikit/flat-button';
import { BackIcon } from '@commercetools-uikit/icons';
import Constraints from '@commercetools-uikit/constraints';
import DataTable from '@commercetools-uikit/data-table';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  Link as RouterLink,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import messages from './messages';
import type { TFetchReviewsQuery } from '../../types/generated/ctp';
import ReviewDetails from '../review-details';

type TReviewsProps = {
  linkToWelcome: string;
};

const columns = [
  { key: 'id', label: 'Review ID' },
  { key: 'key', label: 'Review key', isSortable: true },
  { key: 'rating', label: 'Review Rating', isSortable: true },
  { key: 'state', label: 'Review State', isSortable: true },
];

const Reviews = (props: TReviewsProps) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  // const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
  //   dataLocale: context.dataLocale,
  //   projectLanguages: context.project?.languages,
  // }));
  const { reviewsPaginatedResult, error, loading } = useReviewsFetcher({
    page,
    perPage,
    tableSorting,
  });

  console.log(reviewsPaginatedResult);
  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <FlatButton
          as={RouterLink}
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      {/* <Constraints.Horizontal max={13}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal> */}

      {loading && <LoadingSpinner />}

      {reviewsPaginatedResult ? (
        <Spacings.Stack scale="l">
          <DataTable<NonNullable<TFetchReviewsQuery['reviews']['results']>[0]>
            isCondensed
            columns={columns}
            rows={reviewsPaginatedResult.results}
            itemRenderer={(item, column) => {
              switch (column.key) {
                case 'id':
                  return item.id;
                case 'key':
                  return item.key;
                case 'rating':
                  return item.rating;
                case 'state':
                    return item.state.key;
                default:
                  return null;
              }
            }}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={reviewsPaginatedResult.total}
          />
          <Switch>
            <SuspendedRoute path={`${match.url}/:id`}>
              <ReviewDetails onClose={() => push(`${match.url}`)} />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      ) : null}
    </Spacings.Stack>
  );
};
Reviews.displayName = 'Reviews';

export default Reviews;

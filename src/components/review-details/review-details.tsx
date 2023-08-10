import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  PageNotFound,
  FormModalPage,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useCallback } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import { DOMAINS, NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import {
  useShowNotification,
  useShowApiErrorNotification,
  type TApiErrorNotificationOptions,
} from '@commercetools-frontend/actions-global';
import { PERMISSIONS } from '../../constants';
import {
  useReviewDetailsUpdater,
  useReviewDetailsFetcher,
} from '../../hooks/use-reviews-connector';
// import { docToFormValues, formValuesToDoc } from './conversions';
// import ChannelsDetailsForm from './channel-details-form';
// import { transformErrors } from './transform-errors';
// import messages from './messages';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';
import ReviewDetailsForm from './review-details-form';
import { docToFormValues, formValuesToDoc } from './conversions';
import messages from './messages';
import { transformErrors } from './transform-errors';

type TReviewDetailsProps = {
  onClose: () => void;
};

const ReviewDetails = (props: TReviewDetailsProps) => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  const { loading, error, review } = useReviewDetailsFetcher(params.id);
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const reviewDetailsUpdater = useReviewDetailsUpdater();
  const handleSubmit = useCallback(
    async (formikValues, formikHelpers) => {
      const data = formValuesToDoc(formikValues);
      try {
        await reviewDetailsUpdater.execute({
          originalDraft: review!,
          nextDraft: data,
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.channelUpdated, {
            channelName: formatLocalizedString(formikValues, {
              key: 'name',
              locale: dataLocale,
              fallbackOrder: projectLanguages,
            }),
          }),
        });
      } catch (graphQLErrors) {
        const transformedErrors = transformErrors(graphQLErrors);
        if (transformedErrors.unmappedErrors.length > 0) {
          showApiErrorNotification({
            errors:
              transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
          });
        }

        formikHelpers.setErrors(transformedErrors.formErrors);
      }
    },
    [
      review,
      reviewDetailsUpdater,
      dataLocale,
      intl,
      projectLanguages,
      showApiErrorNotification,
      showNotification,
    ]
  );
  return (
    <ReviewDetailsForm
      initialValues={docToFormValues(review, projectLanguages)}
      onSubmit={handleSubmit}
      isReadOnly={!canManage}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        return (
          <FormModalPage
            title={formProps.values?.key}
            isOpen
            onClose={props.onClose}
            isPrimaryButtonDisabled={
              formProps.isSubmitting || !formProps.isDirty || !canManage
            }
            isSecondaryButtonDisabled={!formProps.isDirty}
            onSecondaryButtonClick={formProps.handleReset}
            onPrimaryButtonClick={() => formProps.submitForm()}
            labelPrimaryButton={FormModalPage.Intl.save}
            labelSecondaryButton={FormModalPage.Intl.revert}
          >
            {loading && (
              <Spacings.Stack alignItems="center">
                <LoadingSpinner />
              </Spacings.Stack>
            )}
            {error && (
              <ContentNotification type="error">
                <Text.Body>
                  {intl.formatMessage(messages.channelDetailsErrorMessage)}
                </Text.Body>
              </ContentNotification>
            )}
            {review && formProps.formElements}
            {review && (
              <ApplicationPageTitle additionalParts={[formProps.values?.key]} />
            )}
            {review === null && <PageNotFound />}
          </FormModalPage>
        );
      }}
    </ReviewDetailsForm>
  );
};
ReviewDetails.displayName = 'ReviewDetails';

export default ReviewDetails;

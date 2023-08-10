import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import type { TFetchReviewDetailsQuery } from '../../types/generated/ctp';
import type { TFormValues } from '../../types';

export const docToFormValues = (
  review: TFetchReviewDetailsQuery['review'],
  languages: string[]
) => ({
  key: review?.key ?? '',
  rating: review?.rating,
  state: review?.state?.key,
  version: review?.version,
  name: LocalizedTextInput.createLocalizedString(
    languages,
    transformLocalizedFieldToLocalizedString(review?.state?.nameAllLocales ?? []) ??
      {}
  ),
});

export const formValuesToDoc = (formValues: TFormValues) => ({
  key: formValues.key,
  rating: formValues.rating,
  state: formValues.state,
  version: formValues.version,
});

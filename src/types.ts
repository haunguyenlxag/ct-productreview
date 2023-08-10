import type { TReviewCustomState } from './types/generated/ctp';

export type TFormValues = {
  key: string;
  rating: string;
  version: string;
  state: TReviewCustomState;
};

export type TSyncAction = { action: string; [x: string]: unknown };

export type TGraphqlUpdateAction = Record<string, Record<string, unknown>>;

export type TChangeNameActionPayload = {
  name: Record<string, string>;
};

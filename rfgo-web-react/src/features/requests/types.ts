export const RequestType = {
  NEW: 'new',
  REV: 'rev',
  REV_SPECIAL: 'rev_special',
} as const;

export type RequestType = (typeof RequestType)[keyof typeof RequestType];

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  [RequestType.NEW]: 'RFG(신규/변경) 의뢰',
  [RequestType.REV]: 'RFG 개별 제품 Revision 의뢰',
  [RequestType.REV_SPECIAL]: 'RFG 개별 제품 Revision 의뢰(Special)',
};

export const REQUEST_TYPE_OPTIONS = Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

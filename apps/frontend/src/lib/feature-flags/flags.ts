export const FLAGS = {
  ENABLE_NEW_REQUEST_FLOW: 'enable_new_request_flow',
  ENABLE_ADMIN_UI: 'enable_admin_ui',
  ENABLE_STATUS_BANNER: 'enable_status_banner',
  ENABLE_BETA_FEATURES: 'enable_beta_features',
  ENABLE_EXPERIMENTAL_VALIDATION: 'enable_experimental_validation',
  ENABLE_REQUEST_PROVISIONING_VIEW: 'enable_request_provisioning_view',
  ENABLE_NEW_DASHBOARD_LAYOUT: 'enable_new_dashboard_layout',
} as const;

export type FlagKeys = typeof FLAGS[keyof typeof FLAGS];

export const FLAG_DEFAULTS: Record<FlagKeys, any> = {
  [FLAGS.ENABLE_NEW_REQUEST_FLOW]: true,
  [FLAGS.ENABLE_ADMIN_UI]: true,
  [FLAGS.ENABLE_STATUS_BANNER]: true,
  [FLAGS.ENABLE_BETA_FEATURES]: false,
  [FLAGS.ENABLE_EXPERIMENTAL_VALIDATION]: false,
  [FLAGS.ENABLE_REQUEST_PROVISIONING_VIEW]: false,
  [FLAGS.ENABLE_NEW_DASHBOARD_LAYOUT]: true,
};

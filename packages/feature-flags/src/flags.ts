export interface FeatureFlags {
  'maintenance-mode': boolean;
  'new-ui-v2': boolean;
  'beta-features': boolean;
  'api-v2-enabled': boolean;
  'discord-bot-monitoring': boolean;
}

export type FlagName = keyof FeatureFlags;

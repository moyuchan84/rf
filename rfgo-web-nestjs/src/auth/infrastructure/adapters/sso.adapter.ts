import { SsoUserProfile } from '../../domain/sso-user-profile';

export abstract class SsoAdapter {
  abstract validate(code: string): Promise<SsoUserProfile>;
  abstract getLoginUrl(): string;
}

import { SsoUserProfile } from '../../domain/sso-user-profile';

export abstract class SsoAdapter {
  abstract validate(idToken: string): Promise<SsoUserProfile>;
  abstract getLoginUrl(): string;
}

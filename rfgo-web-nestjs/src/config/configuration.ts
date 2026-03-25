export interface Config {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  knox: {
    baseUrl: string;
    mailApiUrl: string;
    employeeApiUrl: string;
    approvalApiUrl: string;
  };
  sso: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    certPath: string;
    authUrl: string;
    tokenUrl: string;
  };
}

export default (): Config => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const knoxBaseUrl = process.env.KNOX_API_BASE_URL || 'https://api.knox.samsung.com';

  // 1. 공통 설정 (Common)
  const commonConfig = {
    port: parseInt(process.env.PORT || '9999', 10),
    nodeEnv,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    knox: {
      baseUrl: knoxBaseUrl,
      mailApiUrl: `${knoxBaseUrl}/mail`,
      employeeApiUrl: `${knoxBaseUrl}/employee`,
      approvalApiUrl: `${knoxBaseUrl}/approval`,
    },
  };

  // 2. 환경별 설정 (Development)
  const devConfig = {
    sso: {
      clientId: process.env.SSO_CLIENT_ID || 'dev-rfgo-id',
      clientSecret: process.env.SSO_CLIENT_SECRET || 'dev-secret',
      redirectUri: 'http://localhost:9999/auth/sso/callback',
      certPath: 'certs/public.crt',
      authUrl: 'https://dev-sso.samsung.com/auth',
      tokenUrl: 'https://dev-sso.samsung.com/token',
    },
  };

  // 3. 환경별 설정 (Production)
  const prodConfig = {
    sso: {
      clientId: process.env.SSO_CLIENT_ID || '',
      clientSecret: process.env.SSO_CLIENT_SECRET || '',
      redirectUri: process.env.SSO_REDIRECT_URI || 'https://rfgo.samsung.com/auth/sso/callback',
      certPath: process.env.SSO_CERT_PATH || '/etc/certs/sso-prod.crt',
      authUrl: 'https://sso.samsung.com/auth',
      tokenUrl: 'https://sso.samsung.com/token',
    },
  };

  // 4. NODE_ENV에 따라 병합하여 반환
  const envConfig = nodeEnv === 'production' ? prodConfig : devConfig;

  return {
    ...commonConfig,
    ...envConfig,
    knox: { ...commonConfig.knox }, 
    sso: { ...envConfig.sso },
  };
};

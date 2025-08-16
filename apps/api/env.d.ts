declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production';
    API_PORT?: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    COOKIE_SECRET: string;
    SESSION_COOKIE_NAME: string;
    SESSION_COOKIE_DOMAIN?: string;
    SESSION_COOKIE_SECURE?: string;
    S3_REGION: string;
    S3_BUCKET: string;
    S3_ENDPOINT?: string;
    S3_FORCE_PATH_STYLE?: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    OSRM_BASE_URL?: string;
  }
}
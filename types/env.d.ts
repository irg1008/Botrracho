declare namespace NodeJS {
  interface ProcessEnv {
    TOKEN: string;
    CLIENT_ID: string;
    GUILD_ID: string;
    S3_REGION: string;
    S3_ENDPOINT: string;
    S3_BUCKET: string;
    S3_KEY_ID: string;
    S3_SECRET_KEY: string;
  }
}

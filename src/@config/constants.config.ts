import * as dotenv from 'dotenv';
dotenv.config();

export const PORT: number = parseInt(process.env.PORT!);

export const NODE_ENV = process.env.ENV;

export const JWT_SECRET = process.env.JWT_SECRET!;

export const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
  
export const BASE_URL = {
  frontend: process.env.FRONTEND_URL,
  backend: process.env.BACKEND_URL,
};

export const REVOLUT_ACCESS_TOKEN = process.env.REVOLUT_ACCESS_TOKEN;

// ------------Database Configuration--------------
export const DATABASE = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};

//------------ Email sent configuration----------
export const SMTP_INFO = {
  user: process.env.SMTP_USER!,
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT!),
  password: process.env.SMTP_PASSWORD!,
};

export const FIREBASE_SERVICE_ACCOUNT: {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
} = {
  type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE!,
  project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID!,
  private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY!,
  client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL!,
  client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID!,
  auth_uri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI!,
  token_uri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI!,
  auth_provider_x509_cert_url:
    process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL!,
  client_x509_cert_url:
    process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL!,
  universe_domain: process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN!,
};

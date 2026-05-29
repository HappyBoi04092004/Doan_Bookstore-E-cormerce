import { SePayPgClient } from "sepay-pg-node";

type SePayEnv = "sandbox" | "production";
//type SePayEnv = "sandbox";

const requiredEnv = (key: string) => {
  const value = process.env[key];
  console.log(`Loading env ${key}: ${value ? "FOUND" : "MISSING"}`);
  if (!value) throw new Error(`${key} is required`);
  return value;
};

export const getSePayConfig = () => ({
  merchantId: requiredEnv("SEPAY_MERCHANT_ID"),
  secretKey: requiredEnv("SEPAY_SECRET_KEY"),
  env: (process.env.SEPAY_ENV === "production" ? "production" : "sandbox") as SePayEnv,
  ipnUrl: requiredEnv("SEPAY_IPN_URL"),
  successUrl: requiredEnv("SEPAY_SUCCESS_URL"),
  errorUrl: requiredEnv("SEPAY_ERROR_URL"),
  cancelUrl: requiredEnv("SEPAY_CANCEL_URL"),
});

export const createSePayClient = () => {
  const config = getSePayConfig();

  return new SePayPgClient({
    env: config.env,
    merchant_id: config.merchantId,
    secret_key: config.secretKey,
  });
};

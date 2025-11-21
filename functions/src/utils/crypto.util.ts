import {createHash, randomBytes, createHmac} from "crypto";

export const hashString = (value: string, algorithm = "sha256"): string => {
  return createHash(algorithm).update(value).digest("hex");
};

export const generateToken = (size = 32): string => {
  return randomBytes(size).toString("hex");
};

export const verifyHash = (value: string, hash: string): boolean => {
  return hashString(value) === hash;
};
export const createHmacSignature = (
  value: string,
  secret: string,
  algorithm = "sha256"
): string => {
  return createHmac(algorithm, secret).update(value).digest("hex");
};


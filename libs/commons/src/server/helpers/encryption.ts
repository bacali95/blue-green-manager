import { generateKeyPairSync, privateDecrypt, publicEncrypt } from 'crypto';

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  return generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
}

export function encryptWithPublicKey(payload: string, publicKey: string): string {
  const buffer = Buffer.from(payload, 'utf8');
  const encrypted = publicEncrypt(publicKey, buffer);

  return encrypted.toString('base64');
}

export function decryptWithPrivateKey(payload: string, privateKey: string): string {
  const buffer = Buffer.from(payload, 'base64');
  const decrypted = privateDecrypt(privateKey, buffer);

  return decrypted.toString('utf8');
}

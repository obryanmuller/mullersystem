// src/lib/crypto.ts
import { createCipheriv, createDecipheriv } from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const iv = Buffer.from(process.env.ENCRYPTION_IV!, 'hex');

if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
    throw new Error('As chaves de criptografia não foram definidas no .env');
}

/**
 * Criptografa um texto (como o CPF)
 * @param text O texto a ser criptografado
 * @returns O texto criptografado em formato hexadecimal
 */
export function encrypt(text: string): string {
    const cipher = createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * Descriptografa um texto (como o CPF)
 * @param encryptedText O texto criptografado em formato hexadecimal
 * @returns O texto original
 */
export function decrypt(encryptedText: string): string {
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
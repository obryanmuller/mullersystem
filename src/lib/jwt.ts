import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Gera um token JWT
 */
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

/**
 * Valida um token JWT e retorna o payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as unknown as JWTPayload;
    
    // Validar que o payload contém os campos obrigatórios
    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token inválido ou expirado:', error);
    return null;
  }
}

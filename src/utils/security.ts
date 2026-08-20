/**
 * F2K MOTORS - Utilitários de Segurança & Sanitização
 * Proteção contra XSS, Injeção de Scripts, Spam e Abertura Segura de URLs
 */

// Sanitiza strings de texto livres inseridas pelo usuário
export function sanitizeTextInput(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  
  // Remove caracteres nulos, tags HTML e scripts maliciosos
  const cleaned = input
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();

  return cleaned.slice(0, maxLength);
}

// Sanitiza e normaliza números de telefone
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.slice(0, 15);
}

// Sanitiza e valida formato de CPF
export function sanitizeCpf(cpf: unknown): string {
  if (typeof cpf !== 'string') return '';
  const digitsOnly = cpf.replace(/\D/g, '');
  return digitsOnly.slice(0, 11);
}

// Sanitiza endereços de e-mail
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  const cleaned = email.trim().toLowerCase();
  // Regex de validação básica de e-mail
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (cleaned.length > 100 || !emailRegex.test(cleaned)) {
    return '';
  }
  return cleaned;
}

// Valida e abre URLs externas de forma segura (previne reverse tabnabbing e esquemas maliciosos javascript:)
export function safeOpenUrl(url: string, target: string = '_blank'): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Bloqueia esquemas perigosos como javascript:, vbscript:, data:
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') || 
    lower.startsWith('vbscript:') || 
    lower.startsWith('data:text/html')
  ) {
    console.warn('[Segurança F2K] Bloqueada tentativa de abertura de URL com protocolo não seguro:', trimmed);
    return false;
  }

  // Permite apenas protocolos seguros
  const isSafeProtocol = 
    lower.startsWith('https://') || 
    lower.startsWith('http://') || 
    lower.startsWith('tel:') || 
    lower.startsWith('mailto:') ||
    lower.startsWith('/');

  if (!isSafeProtocol) {
    console.warn('[Segurança F2K] Protocolo não seguro bloqueado:', trimmed);
    return false;
  }

  // Abre com rel noopener e noreferrer
  const newWindow = window.open(trimmed, target, 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
  return true;
}

// Rate Limiter no cliente para formulários e ações repetitivas (Prevenção de spam/bot flood)
const RATE_LIMIT_PREFIX = 'f2k_rl_';

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

export function checkActionRateLimit(
  actionKey: string,
  maxAttempts: number = 3,
  windowSeconds: number = 60
): RateLimitResult {
  const storageKey = `${RATE_LIMIT_PREFIX}${actionKey}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  try {
    const raw = localStorage.getItem(storageKey);
    let attempts: number[] = raw ? JSON.parse(raw) : [];

    // Filtrar apenas tentativas dentro da janela de tempo atual
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (attempts.length >= maxAttempts) {
      const oldestAttempt = attempts[0];
      const retryAfterSeconds = Math.ceil((oldestAttempt + windowMs - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds)
      };
    }

    // Registrar nova tentativa
    attempts.push(now);
    localStorage.setItem(storageKey, JSON.stringify(attempts));

    return {
      allowed: true,
      remainingAttempts: maxAttempts - attempts.length,
      retryAfterSeconds: 0
    };
  } catch {
    // Fallback permissivo se o localStorage falhar
    return {
      allowed: true,
      remainingAttempts: 1,
      retryAfterSeconds: 0
    };
  }
}

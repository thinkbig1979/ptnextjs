/**
 * hCaptcha Verification Utility
 * Server-side verification of hCaptcha tokens
 */

interface HCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
}

/**
 * Verify hCaptcha token with hCaptcha servers
 * @param token - The hCaptcha token from the client
 * @param remoteip - Optional IP address of the user (for additional security)
 * @returns Promise with verification result
 */
export async function verifyHCaptchaToken(
  token: string,
  remoteip?: string
): Promise<HCaptchaVerifyResponse> {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('HCAPTCHA_SECRET_KEY is not configured');
    return {
      success: false,
      'error-codes': ['missing-secret-key'],
    };
  }

  if (!token) {
    return {
      success: false,
      'error-codes': ['missing-input-response'],
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`hCaptcha verification failed with status: ${response.status}`);
    }

    const data: HCaptchaVerifyResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Error verifying hCaptcha token:', error);
    return {
      success: false,
      'error-codes': ['verification-failed'],
    };
  }
}

/**
 * Get human-readable error message for hCaptcha error codes
 * @param errorCodes - Array of error codes from hCaptcha
 * @returns User-friendly error message
 */
export function getHCaptchaErrorMessage(errorCodes?: string[]): string {
  if (!errorCodes || errorCodes.length === 0) {
    return 'Captcha verification failed. Please try again.';
  }

  const errorMap: Record<string, string> = {
    'missing-input-secret': 'Server configuration error. Please contact support.',
    'invalid-input-secret': 'Server configuration error. Please contact support.',
    'missing-input-response': 'Please complete the captcha challenge.',
    'invalid-input-response': 'Invalid captcha response. Please try again.',
    'bad-request': 'Invalid request. Please try again.',
    'invalid-or-already-seen-response': 'This captcha has already been used. Please refresh and try again.',
    'not-using-dummy-passcode': 'Invalid test passcode.',
    'sitekey-secret-mismatch': 'Server configuration error. Please contact support.',
    'missing-secret-key': 'Server configuration error. Please contact support.',
    'verification-failed': 'Could not verify captcha. Please try again.',
  };

  return errorMap[errorCodes[0]] || 'Captcha verification failed. Please try again.';
}

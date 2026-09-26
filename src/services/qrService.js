import { nanoid } from 'nanoid';

/**
 * Generates a secure, random token for the QR rotation.
 * Uses nanoid for fast, URL-friendly unique, non-predictable strings.
 * 
 * @returns {string} Secure rotational token
 */
export const generateSecureToken = () => {
  // Generates a 21-character cryptographic string
  return nanoid();
};

/**
 * Builds the complete URL payload embedded inside the QR code.
 * Uses window.location.origin to dynamically adapt to local dev vs. production hosting.
 *
 * @param {string} sessionId - The current active session ID
 * @param {string} token - The current valid rotating token
 * @returns {string} The full absolute URL for the student to scan
 */
export const buildQRData = (sessionId, token) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/scan?session=${sessionId}&token=${token}`;
};
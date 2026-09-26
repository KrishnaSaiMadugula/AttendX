/**
 * Generates a lightweight device fingerprint based on browser environment.
 * Used as a secondary verification layer to detect if multiple roll numbers 
 * are being submitted from the exact same physical device.
 * 
 * @returns {Object} Telemetry data object
 */
export const generateDeviceFingerprint = () => {
  return {
    userAgent: navigator.userAgent || 'Unknown',
    platform: navigator.platform || navigator.userAgentData?.platform || 'Unknown',
    language: navigator.language || 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    screenWidth: window.screen.width || 0,
    screenHeight: window.screen.height || 0
  };
};
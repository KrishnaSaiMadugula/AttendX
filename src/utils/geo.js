/**
 * Converts degrees to radians for mathematical calculations.
 * @param {number} value - The degree value
 * @returns {number} The radian equivalent
 */
const toRad = (value) => (value * Math.PI) / 180;

/**
 * Calculates the exact distance between two geographical points using the Haversine formula.
 * Used to verify if a student's GPS coordinate is within the teacher's configured radius.
 * 
 * @param {number} lat1 - Latitude of point 1 (Teacher anchor)
 * @param {number} lon1 - Longitude of point 1 (Teacher anchor)
 * @param {number} lat2 - Latitude of point 2 (Student location)
 * @param {number} lon2 - Longitude of point 2 (Student location)
 * @returns {number} The absolute distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's volumetric mean radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Return distance strictly in meters
};
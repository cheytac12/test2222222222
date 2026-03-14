/**
 * Predefined list and bounding boxes for major Indian cities.
 * Used for populating city filter dropdowns and reverse-geocoding GPS coordinates.
 */

/** Alphabetically sorted list of major Indian cities. */
export const INDIAN_CITIES: string[] = [
  'Agra', 'Ahmedabad', 'Amritsar', 'Aurangabad', 'Bangalore', 'Bhopal',
  'Bhubaneswar', 'Chandigarh', 'Chennai', 'Coimbatore', 'Dehradun',
  'Delhi', 'Faridabad', 'Gurgaon', 'Guwahati', 'Hyderabad', 'Indore',
  'Jaipur', 'Jodhpur', 'Kanpur', 'Kochi', 'Kolkata', 'Lucknow',
  'Ludhiana', 'Madurai', 'Meerut', 'Mumbai', 'Mysuru', 'Nagpur',
  'Nashik', 'Noida', 'Patna', 'Pune', 'Raipur', 'Rajkot', 'Ranchi',
  'Surat', 'Thiruvananthapuram', 'Vadodara', 'Varanasi', 'Visakhapatnam',
];

/** Bounding boxes [minLat, maxLat, minLon, maxLon] for reverse-geocoding. */
const CITY_BOUNDS: Record<string, [number, number, number, number]> = {
  Mumbai:             [18.87, 19.45, 72.77, 73.10],
  Delhi:              [28.40, 28.88, 76.84, 77.35],
  Bangalore:          [12.83, 13.18, 77.46, 77.78],
  Hyderabad:          [17.24, 17.56, 78.29, 78.61],
  Ahmedabad:          [22.95, 23.13, 72.52, 72.72],
  Chennai:            [12.86, 13.23, 80.14, 80.30],
  Kolkata:            [22.45, 22.66, 88.25, 88.45],
  Surat:              [21.11, 21.27, 72.77, 72.93],
  Pune:               [18.44, 18.65, 73.77, 73.98],
  Jaipur:             [26.77, 26.99, 75.68, 75.93],
  Lucknow:            [26.73, 26.95, 80.84, 81.05],
  Kanpur:             [26.39, 26.57, 80.29, 80.45],
  Nagpur:             [21.04, 21.25, 78.99, 79.17],
  Patna:              [25.55, 25.67, 85.09, 85.22],
  Indore:             [22.65, 22.77, 75.80, 75.93],
  Bhopal:             [23.18, 23.31, 77.35, 77.50],
  Visakhapatnam:      [17.65, 17.85, 83.18, 83.38],
  Vadodara:           [22.26, 22.38, 73.13, 73.26],
  Coimbatore:         [10.97, 11.08, 76.96, 77.07],
  Kochi:              [ 9.89, 10.05, 76.23, 76.37],
  Agra:               [27.12, 27.26, 77.95, 78.09],
  Varanasi:           [25.29, 25.42, 82.96, 83.09],
  Rajkot:             [22.24, 22.36, 70.76, 70.89],
  Meerut:             [28.97, 29.05, 77.68, 77.76],
  Nashik:             [19.92, 20.06, 73.73, 73.87],
  Ludhiana:           [30.85, 30.97, 75.82, 75.94],
  Amritsar:           [31.62, 31.73, 74.85, 74.97],
  Guwahati:           [26.10, 26.23, 91.67, 91.81],
  Chandigarh:         [30.69, 30.78, 76.76, 76.86],
  Noida:              [28.51, 28.61, 77.37, 77.47],
  Faridabad:          [28.35, 28.45, 77.29, 77.37],
  Gurgaon:            [28.41, 28.52, 76.99, 77.11],
  Thiruvananthapuram: [ 8.47,  8.57, 76.93, 77.03],
  Mysuru:             [12.24, 12.36, 76.60, 76.72],
  Madurai:            [ 9.86,  9.99, 77.99, 78.12],
  Bhubaneswar:        [20.23, 20.34, 85.77, 85.89],
  Raipur:             [21.17, 21.30, 81.62, 81.74],
  Dehradun:           [30.28, 30.39, 78.00, 78.11],
  Ranchi:             [23.32, 23.41, 85.28, 85.37],
  Jodhpur:            [26.24, 26.37, 73.06, 73.20],
  Aurangabad:         [19.82, 19.96, 75.27, 75.42],
};

/** Approximate distance in km between two lat/lon points (Haversine formula). */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in kilometres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Reverse-geocode a lat/lon pair to a known Indian city name.
 * First tries bounding-box matching; if no box matches, falls back to the
 * nearest city centroid within 50 km (Haversine distance).
 * Returns `null` if no city is found within range.
 */
export function reverseGeocodeCity(lat: number, lon: number): string | null {
  // 1. Bounding-box match (fast, exact)
  for (const [city, [minLat, maxLat, minLon, maxLon]] of Object.entries(CITY_BOUNDS)) {
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
      return city;
    }
  }

  // 2. Nearest-city fallback: find the city whose bounding-box centroid is
  //    closest to the given coordinates, within a 50 km radius.
  const MAX_DIST_KM = 50;
  let bestCity: string | null = null;
  let bestDist = Infinity;

  for (const [city, [minLat, maxLat, minLon, maxLon]] of Object.entries(CITY_BOUNDS)) {
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const dist = haversineKm(lat, lon, centerLat, centerLon);
    if (dist < bestDist) {
      bestDist = dist;
      bestCity = city;
    }
  }

  return bestDist <= MAX_DIST_KM ? bestCity : null;
}

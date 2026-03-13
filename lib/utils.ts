/**
 * Generates a unique complaint ID in the format "CR-XXXXX"
 * where XXXXX is a zero-padded random 5-digit number.
 */
export function generateComplaintId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 10000-99999
  return `CR-${randomNum}`;
}

/**
 * Formats an ISO date string to a human-readable format.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Returns a Tailwind CSS color class based on complaint status.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Returns a hex color for Leaflet map markers based on status.
 */
export function getMarkerColor(status: string): string {
  switch (status) {
    case 'Pending':
      return '#EAB308';   // yellow-500
    case 'In Progress':
      return '#3B82F6';   // blue-500
    case 'Resolved':
      return '#22C55E';   // green-500
    default:
      return '#6B7280';   // gray-500
  }
}

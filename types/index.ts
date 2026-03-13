// TypeScript types matching the Supabase database schema

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export type IssueType =
  | 'Robbery'
  | 'Murder'
  | 'Assault'
  | 'Theft'
  | 'Harassment'
  | 'Missing Person'
  | 'Other';

export interface Complaint {
  id: string;               // UUID primary key
  complaint_id: string;     // e.g. "CR-10294"
  name: string;
  phone: string;
  issue_type: IssueType | string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  status: ComplaintStatus;
  created_at: string;       // ISO timestamp
}

export interface ComplaintImage {
  id: string;
  complaint_id: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export interface StatusUpdate {
  id: string;
  complaint_id: string;
  old_status: string | null;
  new_status: string;
  updated_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface ComplaintWithImages extends Complaint {
  complaint_images: ComplaintImage[];
}

// Form data submitted from the complaint registration form
export interface ComplaintFormData {
  name: string;
  phone: string;
  issue_type: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

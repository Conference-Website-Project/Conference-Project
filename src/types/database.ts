export type UserRole = 'ADMIN' | 'PARTICIPANT' | 'REVIEWER' | 'CHAIR';

export type PaperStatus = 
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CAMERA_READY_SUBMITTED';

export type RegistrationCategory = 
  | 'STUDENT'
  | 'FACULTY'
  | 'INDUSTRY'
  | 'ATTENDEE_ONLY';

export type PaymentStatus = 
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REFUNDED';

export type ParticipationType = 'AUTHOR' | 'DELEGATE';

export interface Profile {
  id: string; // References auth.users(id)
  full_name: string;
  email: string;
  phone?: string;
  institution: string;
  designation?: string;
  country: string;
  role: UserRole;
  avatar_url?: string;
  onboarding_completed: boolean;
  participation_type: ParticipationType;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends Profile {}

export interface Conference {
  id: string;
  name: string;
  short_name: string;
  year: number;
  theme: string;
  description?: string;
  start_date: string;
  end_date: string;
  institution: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  contact_email: string;
  contact_phone?: string;
  registration_open: boolean;
  paper_submission_open: boolean;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ConferenceTrack {
  id: string;
  conference_id: string;
  code: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface DatabaseImportantDate {
  id: string;
  conference_id: string;
  title: string;
  date_value: string;
  highlight: boolean;
  display_order: number;
}

export interface DatabaseSpeaker {
  id: string;
  conference_id: string;
  name: string;
  title: string;
  affiliation: string;
  bio?: string;
  topic: string;
  image_url?: string;
  display_order: number;
}

export interface DatabaseCommitteeMember {
  id: string;
  conference_id: string;
  name: string;
  role: string;
  affiliation: string;
  category: 'patron' | 'chair' | 'organizing' | 'technical';
  display_order: number;
}

export interface Paper {
  id: string;
  paper_id?: string; // Human readable ID like ICARET27-0001
  conference_id: string;
  track_id: string;
  author_user_id: string;
  title: string;
  abstract: string;
  keywords: string[];
  file_url?: string;
  manuscript_path?: string;
  status: PaperStatus;
  submission_date: string;
  created_at?: string;
  updated_at: string;
}

export interface PaperAuthor {
  id?: string;
  paper_id?: string;
  author_name: string;
  author_email: string;
  affiliation: string;
  is_corresponding: boolean;
  display_order: number;
  created_at?: string;
}

export interface PaperWithDetails extends Paper {
  track?: ConferenceTrack;
  authors?: PaperAuthor[];
  submitter_profile?: Profile;
}

export interface CreatePaperInput {
  title: string;
  abstract: string;
  keywords: string[];
  track_id: string;
  conference_id?: string;
  authors: Omit<PaperAuthor, 'id' | 'paper_id'>[];
  file: File;
}

export interface UpdatePaperInput {
  title?: string;
  abstract?: string;
  keywords?: string[];
  track_id?: string;
  authors?: Omit<PaperAuthor, 'id' | 'paper_id'>[];
  file?: File;
}

export interface Registration {
  id: string;
  conference_id: string;
  user_id: string;
  category: RegistrationCategory;
  amount_due: number;
  currency: string;
  is_paid: boolean;
  paper_id?: string;
  dietary_requirements?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  registration_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transaction_reference?: string;
  gateway_payment_id?: string;
  payment_method?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  conference_id: string;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string;
}

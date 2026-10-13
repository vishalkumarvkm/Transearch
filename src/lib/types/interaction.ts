export interface TranscriptSegment {
  speaker: 'User' | 'Assistant' | string;
  text: string;
  timestamp?: string | number;
}

export interface CandidateLeadInfo {
  name?: string;
  email?: string;
  phone?: string;
  currentRole?: string;
  notes?: string;
}

export interface GeoLocationInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  isLocal?: boolean;
}

export interface CallInteraction {
  id: string;
  sessionId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  startedAt: string; // ISO string
  endedAt?: string; // ISO string
  durationSecs: number;
  durationFormatted: string;
  ipAddress: string;
  geoLocation: GeoLocationInfo;
  agentId: string;
  agentName: string;
  mandate: string;
  route: string;
  userAgent?: string;
  deviceType?: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  candidateInfo?: CandidateLeadInfo;
  segments: TranscriptSegment[];
  totalTurns: number;
  status: 'Completed' | 'Lead Captured' | 'In Progress' | 'Aborted';
  createdAt: string;
}

export interface CallStats {
  totalCalls: number;
  totalDurationSecs: number;
  totalDurationFormatted: string;
  totalLeadsCaptured: number;
  uniqueLocationsCount: number;
  topAgents: { agentName: string; count: number }[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'consultant' | 'auditor';
}

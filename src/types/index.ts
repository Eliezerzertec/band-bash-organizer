export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  whatsapp?: string;
  status: 'active' | 'inactive';
}

export interface Church {
  id: string;
  name: string;
  address: string;
  contact: string;
  logo?: string;
  createdAt: Date;
}

export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  leaders: string[];
  logo?: string;
  profilePhoto?: string;
}

export interface Member {
  id: string;
  userId: string;
  ministryId: string;
  name: string;
  photo?: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  skills: MusicalSkill[];
  status: 'active' | 'inactive';
}

export type MusicalSkill = 
  | 'vocal'
  | 'guitar'
  | 'bass'
  | 'drums'
  | 'keyboard'
  | 'piano'
  | 'violin'
  | 'flute'
  | 'saxophone'
  | 'trumpet'
  | 'acoustic_guitar'
  | 'backing_vocal'
  | 'audio_tech'
  | 'projection';

export interface Team {
  id: string;
  ministryId: string;
  name: string;
  members: TeamMember[];
}

export interface TeamMember {
  memberId: string;
  role: string;
  skill: MusicalSkill;
}

export interface ServiceEvent {
  id: string;
  churchId: string;
  ministryId: string;
  teamId?: string;
  title: string;
  date: Date;
  time: string;
  description?: string;
  scheduledMembers: ScheduledMember[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ScheduledMember {
  memberId: string;
  skill: MusicalSkill;
  confirmed: boolean;
}

export interface SubstitutionRequest {
  id: string;
  eventId: string;
  requesterId: string;
  targetMemberId?: string;
  skill: MusicalSkill;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  recipientType: 'all' | 'team' | 'member';
  recipientId?: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'schedule' | 'substitution' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

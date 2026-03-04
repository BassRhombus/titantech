export interface ServerSubmission {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  discordInvite: string;
  ownerDiscord: string;
  serverIP: string;
  queryPort: number;
  showIP: boolean;
  submittedBy: string;
  userId?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  submittedAt: Date;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
}

export interface Suggestion {
  id: string;
  title: string;
  category: 'features' | 'map-changes' | 'bugs' | 'other';
  description: string;
  author: string;
  votes: number;
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  likes: number;
  suggestionId: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  endDateTime?: Date | null;
  serverName?: string | null;
  category: 'tournament' | 'community' | 'roleplay' | 'pvp' | 'other';
  imageUrl?: string | null;
  creatorId: string;
  discordLink?: string | null;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  generatorType: 'commands-ini' | 'game-ini' | 'rules-motd' | 'mod-manager';
  name: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

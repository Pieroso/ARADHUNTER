// Base types for Firebase data models
export interface UserData {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  totalCaptured: number;
  vouchersGenerated: number;
  role: 'player' | 'admin' | 'sponsor';
  banned: boolean;
  myReferralCode: string;
  totalInvites: number;
  emailVerified: boolean;
  sponsorName?: string;
  createdAt: Date;
  updatedAt: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Objective {
  id: string;
  name: string;
  description: string;
  points: number;
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  location: string;
  sponsor: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  image: string;
  arImage?: string;
  markerImage?: string;
  active: boolean;
  category?: string;
  specialPrize?: {
    enabled: boolean;
    name: string;
    description: string;
    bonusPoints: number;
    icon: string;
    animation: 'bounce' | 'spin' | 'pulse';
  };
  arConfig?: {
    maxDistance: number;
    headingTolerance: number;
    pitchTolerance: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  value: number;
  pointsCost: number;
  expiryDays: number;
  image: string;
  sponsor: string;
  available: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserVoucher {
  id: string;
  userId: string;
  originalVoucherId: string;
  code: string;
  description: string;
  value: number;
  pointsCost: number;
  sponsor: string;
  image: string;
  redeemedAt: Date;
  expiresAt: Date;
  used: boolean;
  status: 'active' | 'presented' | 'verified';
  verifiedAt?: Date;
  verifiedBy?: string;
  presentedAt?: Date;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  category: string;
  activeObjectives: number;
  totalVouchers: number;
  commission: number;
  revenue: number;
  status: string;
  budget: number;
  createdAt: Date;
  updatedAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
  Sponsor: undefined;
  Profile: undefined;
};

export type PlayerTabParamList = {
  Home: undefined;
  Profile: undefined;
};

// Component props types
export interface AuthContextType {
  user: UserData | null;
  location: { lat: number; lng: number } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLocation: () => Promise<void>;
}

export interface AppContextType {
  objectives: Objective[];
  vouchers: Voucher[];
  userVouchers: UserVoucher[];
  leaderboard: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
  scanObjective: (objectiveId: string) => Promise<void>;
  redeemVoucher: (voucherId: string) => Promise<void>;
  useVoucher: (voucherId: string) => Promise<void>;
}
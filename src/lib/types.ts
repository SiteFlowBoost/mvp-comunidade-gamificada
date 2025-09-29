// Tipos para a plataforma Comunidade Local Ativa

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  level: number;
  badges: Badge[];
  joinedAt: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  image?: string;
  phone?: string;
  website?: string;
  offers: Offer[];
  verified: boolean;
}

export interface Offer {
  id: string;
  businessId: string;
  title: string;
  description: string;
  discount: number;
  pointsRequired: number;
  validUntil: Date;
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'visit' | 'purchase' | 'review' | 'share' | 'referral';
  businessId?: string;
  points: number;
  description: string;
  timestamp: Date;
}

export interface GameLevel {
  level: number;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}
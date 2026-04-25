export type View = 'home' | 'search' | 'sell' | 'styler' | 'profile' | 'cart' | 'user-posts' | 'user-products' | 'user-wardrobe' | 'ai-consults' | 'category-results';

export interface AIConsult {
  id: string;
  userId: string;
  type: 'repair' | 'styling';
  image: string;
  response: string;
  createdAt: any;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  seller: string;
  sellerImage?: string;
  description: string;
  createdAt?: any;
  isPrivate?: boolean;
  ecoImpact?: {
    waterSaved: number;
    co2Offset: number;
  };
}

export interface Outfit {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  items: string[]; // Product IDs
  likes: number;
  comments: number;
  image: string;
  caption?: string;
  createdAt?: string;
  isPrivate?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  sustainabilityScore: number;
  upcyclePoints: number;
  carbonOffset: number;
  itemsSaved: number;
  earnings: number;
  isPrivate?: boolean;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  image: string;
  category: string;
  addedAt: any;
}

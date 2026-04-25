import { Product, Outfit, UserProfile } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    userId: 'system',
    name: 'Vintage Denim Jacket',
    price: 45,
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80',
    category: 'Outerwear',
    seller: 'VintageVibes',
    ecoImpact: { waterSaved: 2500, co2Offset: 15 },
    description: 'Classic 90s denim jacket with a unique wash.'
  },
  {
    id: '2',
    userId: 'system',
    name: 'Floral Silk Scarf',
    price: 22,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    seller: 'SilkRoad',
    ecoImpact: { waterSaved: 800, co2Offset: 5 },
    description: 'Hand-painted floral silk scarf from the 70s.'
  },
  {
    id: '3',
    userId: 'system',
    name: 'Corduroy Trousers',
    price: 38,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    category: 'Pants',
    seller: 'RetroRelics',
    ecoImpact: { waterSaved: 1200, co2Offset: 8 },
    description: 'High-waisted corduroy trousers in a rich brown.'
  },
  {
    id: '4',
    userId: 'system',
    name: 'Embroidered Vest',
    price: 30,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    category: 'Tops',
    seller: 'CraftyCreator',
    ecoImpact: { waterSaved: 500, co2Offset: 3 },
    description: 'Hand-embroidered vest with colorful patterns.'
  }
];

export const MOCK_OUTFITS: Outfit[] = [
  {
    id: 'o1',
    userId: 'u1',
    userName: 'Luna Love',
    userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    items: ['1', '2'],
    likes: 124,
    comments: 12,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'o2',
    userId: 'u2',
    userName: 'Retro Rick',
    userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    items: ['3', '4'],
    likes: 89,
    comments: 5,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_USER: UserProfile = {
  id: 'u1',
  name: 'Luna Love',
  email: 'luna@example.com',
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  sustainabilityScore: 850,
  upcyclePoints: 1250,
  carbonOffset: 45.5,
  itemsSaved: 24,
  earnings: 342.50
};

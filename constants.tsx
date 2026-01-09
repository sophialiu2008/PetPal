
import { Pet } from './types.ts';

export const PETS: Pet[] = [
  {
    id: '1',
    name: 'Bella',
    breed: 'Golden Retriever',
    age: '3 months',
    distance: '2.5km',
    gender: 'Female',
    weight: '8kg',
    size: 'Medium',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
    personality: ['Friendly', 'Active', 'Smart'],
    description: 'Bella is a sweet golden retriever puppy looking for a loving home with plenty of space to run.',
    adoptionStatus: 'Available',
    owner: {
      name: 'Sarah J.',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      location: 'San Francisco, CA'
    }
  },
  {
    id: '2',
    name: 'Mochi',
    breed: 'British Shorthair',
    age: '2 years',
    distance: '5km',
    gender: 'Male',
    weight: '4.5kg',
    size: 'Small',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    personality: ['Quiet', 'Independent', 'Cuddly'],
    description: 'Mochi is a sophisticated gentleman who loves lounging in sunbeams and gentle head scratches.',
    adoptionStatus: 'Pending',
    owner: {
      name: 'David W.',
      avatar: 'https://i.pravatar.cc/150?u=david',
      location: 'Oakland, CA'
    }
  },
  {
    id: '3',
    name: 'Charlie',
    breed: 'French Bulldog',
    age: '4 years',
    distance: '1.2km',
    gender: 'Male',
    weight: '12kg',
    size: 'Small',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    personality: ['Playful', 'Brave', 'Loyal'],
    description: 'Charlie is a small dog with a big heart. He gets along great with children and other pets.',
    adoptionStatus: 'Adopted',
    owner: {
      name: 'Emma L.',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      location: 'San Mateo, CA'
    }
  },
  {
    id: '4',
    name: 'Luna',
    breed: 'Siamese',
    age: '1 year',
    distance: '8km',
    gender: 'Female',
    weight: '3.8kg',
    size: 'Small',
    image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=600',
    personality: ['Vocal', 'Social', 'Curious'],
    description: 'Luna is a social butterfly who will follow you around and talk to you all day long.',
    adoptionStatus: 'Available',
    owner: {
      name: 'Michael R.',
      avatar: 'https://i.pravatar.cc/150?u=mike',
      location: 'San Jose, CA'
    }
  },
  {
    id: '5',
    name: 'Ghost',
    breed: 'Husky Mix',
    age: '2 years',
    distance: '12km',
    gender: 'Male',
    weight: '15kg',
    size: 'Large',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=600',
    personality: ['Shy', 'Calm'],
    description: 'A mysterious dog found wandering. He needs a patient owner to help him come out of his shell.',
    adoptionStatus: 'Available',
    owner: {
      name: 'Shelter Alpha',
      avatar: 'https://i.pravatar.cc/150?u=shelter',
      location: 'Berkeley, CA'
    }
  }
];


export type PetType = 'All' | 'Dogs' | 'Cats' | 'Birds' | 'Small';

export type AdoptionStatus = 'Available' | 'Adopted' | 'Pending';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  distance: string;
  image: string;
  gender: 'Male' | 'Female';
  weight: string;
  size: 'Small' | 'Medium' | 'Large';
  personality: string[];
  description: string;
  adoptionStatus: AdoptionStatus;
  owner: {
    name: string;
    avatar: string;
    location: string;
  }
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface AdoptionApplication {
  id: string;
  petName: string;
  petImage: string;
  status: 'Reviewing' | 'Interview' | 'Home Visit' | 'Approved' | 'Rejected';
  date: string;
}

export type Page = 'welcome' | 'home' | 'details' | 'adopted' | 'profile' | 'map' | 'post' | 'community' | 'guide' | 'messages' | 'applications';

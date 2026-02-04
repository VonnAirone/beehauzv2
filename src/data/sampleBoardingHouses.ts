import { BoardingHouse } from '../types/tenant';

export const sampleBoardingHouses: BoardingHouse[] = [
  {
    id: '1',
    name: 'UA Student Lodge',
    location: '200m from UA Main Gate, Sibalom',
    availableBeds: 8,
    rating: 4.7,
    ratePerMonth: 2500,
    description: 'Clean and affordable boarding house just 5 minutes walk from University of Antique in Sibalom. Perfect for students with study-friendly environment and fast internet.',
    paymentTerms: {
      advancePayment: 1,
      deposit: 1500,
      electricityIncluded: false,
      waterIncluded: true,
    },
    roomTypes: [
      { type: 'solo', available: 2, pricePerMonth: 3500 },
      { type: '4-person', available: 6, pricePerMonth: 2500 }
    ],
    amenities: ['Free WiFi', 'Kitchen Access', 'Study Area', 'Security', 'Water Station'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300'
    ],
    ownerId: 'owner1',
    owner: {
      id: 'owner1',
      name: 'Tita Merlinda Pascual',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 34,
    distance: 0.3,
    isAvailable: true,
    bathrooms: 3,
    capacity: 12,
    rules: ['No smoking', 'Quiet hours: 10 PM - 5 AM', 'No overnight guests'],
    nearbyLandmarks: ['UA Main Gate', 'University of Antique', 'Jollibee Sibalom', 'Public Market'],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z'
  },
  {
    id: '2',
    name: 'Kuya Jun\'s Boarding House',
    location: 'Beside Sibalom Public Market, 8 mins walk to UA',
    availableBeds: 6,
    rating: 4.3,
    ratePerMonth: 2200,
    description: 'Budget-friendly boarding house near the market. Easy access to affordable food and transportation to campus.',
    paymentTerms: {
      advancePayment: 1,
      deposit: 1200,
      electricityIncluded: true,
      waterIncluded: true,
    },
    roomTypes: [
      { type: '6-person', available: 6, pricePerMonth: 2200 }
    ],
    amenities: ['Free WiFi', 'Kitchen Access', 'Laundry Area', 'Parking', 'TV Area'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300'
    ],
    ownerId: 'owner2',
    owner: {
      id: 'owner2',
      name: 'Jun Villanueva',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 28,
    distance: 0.8,
    isAvailable: true,
    bathrooms: 2,
    capacity: 10,
    rules: ['Keep common areas clean', 'No loud music after 9 PM', 'Weekly room inspection'],
    nearbyLandmarks: ['Sibalom Public Market', 'Tricycle Terminal', 'BDO Sibalom'],
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-03-18T16:45:00Z'
  },
  {
    id: '3',
    name: 'Casa Verde Student Home',
    location: 'Poblacion Center, Sibalom - 12 mins walk to UA',
    availableBeds: 10,
    rating: 4.5,
    ratePerMonth: 2800,
    description: 'Modern boarding house with air-conditioned common areas and reliable internet. Popular among UA nursing and education students.',
    paymentTerms: {
      advancePayment: 2,
      deposit: 2000,
      electricityIncluded: false,
      waterIncluded: true,
    },
    roomTypes: [
      { type: 'solo', available: 3, pricePerMonth: 4000 },
      { type: '4-person', available: 7, pricePerMonth: 2800 }
    ],
    amenities: ['Free WiFi', 'Air Conditioning', 'Kitchen Access', 'Study Room', 'CCTV'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300'
    ],
    ownerId: 'owner3',
    owner: {
      id: 'owner3',
      name: 'Ate Rosa Hernandez',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 42,
    distance: 1.2,
    isAvailable: true,
    bathrooms: 4,
    capacity: 15,
    rules: ['No pets allowed', 'Curfew at 11 PM', 'Monthly room cleaning fee'],
    nearbyLandmarks: ['Sibalom Municipal Hall', 'St. Vincent Ferrer Church', 'Palengke'],
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-03-25T10:20:00Z'
  },
  {
    id: '4',
    name: 'Bahay Kubo Lodge',
    location: 'Near UA Back Gate, Sibalom',
    availableBeds: 12,
    rating: 4.1,
    ratePerMonth: 2000,
    description: 'Most affordable boarding house in Sibalom. Basic but clean accommodation perfect for students on tight budget.',
    paymentTerms: {
      advancePayment: 1,
      deposit: 1000,
      electricityIncluded: false,
      waterIncluded: true,
    },
    amenities: ['Free WiFi', 'Kitchen Access', 'Water Station', 'Common Toilet'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300',
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&h=300'
    ],
    ownerId: 'owner4',
    owner: {
      id: 'owner4',
      name: 'Manong Eddie Ramos',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 19,
    distance: 0.6,
    isAvailable: true,
    bathrooms: 3,
    capacity: 18,
    rules: ['Pay rent on time', 'Bring own bedding', 'No alcohol inside premises'],
    nearbyLandmarks: ['UA Back Gate', 'University of Antique', 'Sari-sari Store', 'Basketball Court'],
    createdAt: '2024-02-10T13:45:00Z',
    updatedAt: '2024-03-15T09:10:00Z'
  },
  {
    id: '5',
    name: 'Nanay Beth\'s Student Haven',
    location: 'Behind Sibalom District Hospital, 12 mins to UA',
    availableBeds: 7,
    rating: 4.8,
    ratePerMonth: 3200,
    description: 'Home-like atmosphere with meals included! Nanay Beth treats students like family. Very popular among female students and nursing majors.',
    paymentTerms: {
      advancePayment: 1,
      deposit: 2500,
      electricityIncluded: true,
      waterIncluded: true,
    },
    amenities: ['Free WiFi', 'Meals Included', 'Laundry Service', 'Study Area', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300',
      'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=400&h=300'
    ],
    ownerId: 'owner5',
    owner: {
      id: 'owner5',
      name: 'Nanay Beth Aquino',
      profileImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 67,
    distance: 1.0,
    isAvailable: true,
    bathrooms: 3,
    capacity: 10,
    rules: ['Female students only', 'Meal times strictly observed', 'Help with household chores'],
    nearbyLandmarks: ['Sibalom District Hospital', 'Public Cemetery', 'Mini Grocery'],
    createdAt: '2024-01-25T07:20:00Z',
    updatedAt: '2024-03-22T12:15:00Z'
  },
  {
    id: '6',
    name: 'UA Heights Dormitel',
    location: 'Along National Highway, 8 mins tricycle to UA',
    availableBeds: 16,
    rating: 4.4,
    ratePerMonth: 2600,
    description: 'Newest boarding house in Sibalom with modern facilities. Great for students who want comfort and convenience with easy transportation access.',
    paymentTerms: {
      advancePayment: 2,
      deposit: 1800,
      electricityIncluded: false,
      waterIncluded: true,
    },
    amenities: ['Free WiFi', 'Kitchen Access', 'Common TV Area', 'Parking', 'Vending Machine'],
    images: [
      'https://images.unsplash.com/photo-1560448075-bb485b067938?w=400&h=300',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300'
    ],
    ownerId: 'owner6',
    owner: {
      id: 'owner6',
      name: 'Kuya Mark Santos',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 15,
    distance: 1.5,
    isAvailable: true,
    bathrooms: 5,
    capacity: 20,
    rules: ['No smoking anywhere', 'Visitor registration required', '24/7 security monitoring'],
    nearbyLandmarks: ['Shell Gas Station', 'Puregold Sibalom', 'LBC Branch'],
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-03-28T11:45:00Z'
  },
  {
    id: '7',
    name: 'Ate Joy\'s Bed Spacer',
    location: 'Barangay Sawaga, 20 mins habal-habal to UA',
    availableBeds: 4,
    rating: 3.9,
    ratePerMonth: 1800,
    description: 'Super budget-friendly bed spacer for students from far provinces. Shared rooms but very affordable. Perfect for those who need to save money.',
    paymentTerms: {
      advancePayment: 1,
      deposit: 800,
      electricityIncluded: true,
      waterIncluded: true,
    },
    amenities: ['Free WiFi', 'Shared Kitchen', 'Common CR', 'Rice Cooker'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300'
    ],
    ownerId: 'owner7',
    owner: {
      id: 'owner7',
      name: 'Joy Magbanua',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 12,
    distance: 3.2,
    isAvailable: true,
    bathrooms: 2,
    capacity: 8,
    rules: ['Shared room with 2 beds', 'Bring own mattress', 'Clean after use'],
    nearbyLandmarks: ['Barangay Hall Sawaga', 'Elementary School', 'Copra Drier'],
    createdAt: '2024-02-14T10:20:00Z',
    updatedAt: '2024-03-12T08:15:00Z'
  },
  {
    id: '8',
    name: 'Lolo Isko\'s Transient House',
    location: 'Near Sibalom River, 18 mins walk to UA',
    availableBeds: 9,
    rating: 4.2,
    ratePerMonth: 2300,
    description: 'Peaceful location by the river with natural cooling. Former teacher Lolo Isko maintains a study-conducive environment. Great for serious students.',
    paymentTerms: {
      advancePayment: 1,
      deposit: 1500,
      electricityIncluded: false,
      waterIncluded: true,
    },
    amenities: ['Free WiFi', 'Kitchen Access', 'Study Hall', 'Library Corner', 'Garden'],
    images: [
      'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=400&h=300',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300'
    ],
    ownerId: 'owner8',
    owner: {
      id: 'owner8',
      name: 'Lolo Isko Delgado',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 38,
    distance: 1.8,
    isAvailable: true,
    bathrooms: 3,
    capacity: 12,
    rules: ['Study hours: 7-9 PM (mandatory quiet)', 'No gaming during study time', 'Educational discussions encouraged'],
    nearbyLandmarks: ['Sibalom River', 'Barangay Bridge', 'Rice Fields'],
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-03-19T15:20:00Z'
  },
  {
    id: '9',
    name: 'Modern Student Hub',
    location: 'Behind Gaisano Grand Mall, 12 mins tricycle to UA',
    availableBeds: 11,
    rating: 4.6,
    ratePerMonth: 3000,
    description: 'Contemporary boarding house with mall access for shopping and dining. Perfect for students who want modern conveniences and entertainment nearby.',
    paymentTerms: {
      advancePayment: 2,
      deposit: 2200,
      electricityIncluded: false,
      waterIncluded: true,
    },
    amenities: ['High-Speed WiFi', 'Air Conditioning', 'Kitchen Access', 'Game Room', 'CCTV', 'Elevator'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300'
    ],
    ownerId: 'owner9',
    owner: {
      id: 'owner9',
      name: 'Sir Jerome Lapuz',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 23,
    distance: 1.3,
    isAvailable: true,
    bathrooms: 4,
    capacity: 16,
    rules: ['No loud parties', 'Visitor curfew at 9 PM', 'Keep common areas clean'],
    nearbyLandmarks: ['Gaisano Grand Mall', 'McDonald\'s', 'BPI Family Bank', 'WVSU Campus'],
    createdAt: '2024-02-20T11:45:00Z',
    updatedAt: '2024-03-26T14:10:00Z'
  },
  {
    id: '10',
    name: 'Kumare Nene\'s Boarding',
    location: 'Sitio Crossing, near Jeepney Terminal to UA',
    availableBeds: 8,
    rating: 4.0,
    ratePerMonth: 2400,
    description: 'Convenient location near public transport. Kumare Nene is known for being understanding with payment terms during exam periods. Student-friendly policies.',
    paymentTerms: {
      advancePayment: 1,
      deposit: 1300,
      electricityIncluded: true,
      waterIncluded: true,
    },
    amenities: ['Free WiFi', 'Kitchen Access', 'Laundry Area', 'Common TV', 'Water Dispenser'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300',
      'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=400&h=300'
    ],
    ownerId: 'owner10',
    owner: {
      id: 'owner10',
      name: 'Nene Tolentino',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    reviewCount: 31,
    distance: 2.1,
    isAvailable: true,
    bathrooms: 3,
    capacity: 12,
    rules: ['Flexible payment during exams', 'No overnight guests during weekdays', 'Community cleaning every Saturday'],
    nearbyLandmarks: ['Jeepney Terminal', 'Crossing Market', 'Barangay Health Center', 'CPU Campus'],
    createdAt: '2024-01-18T13:15:00Z',
    updatedAt: '2024-03-20T16:30:00Z'
  }
];

import { TravelRequest, ComfortLevel, TripType, Partner, Client, FeaturedOffer } from './types';

export const INITIAL_PLATFORM_COMMISSION_RATE = 0.15; // 15% commission

export const COMFORT_LEVELS = Object.values(ComfortLevel);
export const TRIP_TYPES = Object.values(TripType);

export const MOCK_CLIENTS: Client[] = [
    { 
        id: 'C-1', 
        name: 'أحمد المنصور', 
        email: 'ahmed.mansour@email.com', 
        joinDate: '2024-05-10', 
        phone: '0505123456', 
        preferredDestinations: 'دبي، لندن، المالديف', 
        travelPreferences: 'يفضل الفنادق الفاخرة ذات الإطلالة، ويهتم بتجارب الطعام الراقي.', 
        loyaltyTier: 'Gold', 
        agreementSignedAt: '2024-05-10T10:00:00Z', 
        agreementVersion: '2.1' 
    },
    { 
        id: 'C-2', 
        name: 'سارة الشمري', 
        email: 'sarah.shammari@email.com', 
        joinDate: '2024-06-01', 
        phone: '0559876543', 
        preferredDestinations: 'باريس، سويسرا، النمسا',
        travelPreferences: 'تحب الطبيعة والأماكن الهادئة، وتفضل الرحلات العائلية.',
        loyaltyTier: 'Silver', 
        agreementSignedAt: '2024-06-01T12:00:00Z', 
        agreementVersion: '2.1' 
    },
    { 
        id: 'C-3', 
        name: 'خالد الدوسري', 
        email: 'khaled.dossari@email.com', 
        joinDate: '2024-07-22', 
        phone: '0533219876', 
        preferredDestinations: 'القاهرة، إسطنبول، نيويورك',
        travelPreferences: 'مهتم بالرحلات الثقافية والتاريخية، ويفضل السكن قرب وسط المدينة.', 
        loyaltyTier: 'Bronze', 
        agreementSignedAt: '2024-07-22T14:00:00Z', 
        agreementVersion: '2.1' 
    },
];


export const MOCK_PARTNERS: Partner[] = [
  { 
      id: 'P-1', 
      name: 'وكالة أفق الرفاهية', 
      rating: 4.9, 
      specialty: 'الرحلات الفاخرة والنخبة', 
      contactEmail: 'contact@luxuryhorizon.com', 
      status: 'Active', 
      joinDate: '2023-01-15', 
      contactPerson: 'محمد العتيبي', 
      phone: '011-456-7890', 
      address: 'طريق الملك فهد، الرياض', 
      notes: 'شريك استراتيجي لقطاع كبار الشخصيات.', 
      performanceTier: 'Elite',
      agreementSignedAt: '2023-01-15T10:00:00Z',
      agreementVersion: '2.1',
      bio: 'أفق الرفاهية هي الرائدة في تصميم الرحلات المخصصة للنخبة. بخبرة تتجاوز 15 عاماً، نقدم تجارب سفر استثنائية مع خدمات كونسيرج على مدار الساعة.',
      galleryImageUrls: [
          'https://picsum.photos/seed/p1-gallery1/800/600',
          'https://picsum.photos/seed/p1-gallery2/800/600',
          'https://picsum.photos/seed/p1-gallery3/800/600'
      ],
      websiteUrl: 'https://luxuryhorizon.sa'
  },
  { 
      id: 'P-2', 
      name: 'سفريات المسافر الذكي', 
      rating: 4.6, 
      specialty: 'باقات اقتصادية وعائلية', 
      contactEmail: 'info@smarttraveler.com', 
      status: 'Active', 
      joinDate: '2023-03-20', 
      contactPerson: 'ليلى الحربي', 
      phone: '012-654-3210', 
      address: 'شارع التحلية، جدة', 
      performanceTier: 'Preferred',
      agreementSignedAt: '2023-03-20T11:00:00Z',
      agreementVersion: '2.1',
      bio: 'في المسافر الذكي، نؤمن بأن السفر حق للجميع. نقدم أفضل الباقات الاقتصادية للوجهات الشهيرة دون المساومة على جودة الخدمة والموثوقية.',
      galleryImageUrls: [
          'https://picsum.photos/seed/p2-gallery1/800/600'
      ],
      websiteUrl: 'https://smarttraveler.sa'
  },
  { 
      id: 'P-3', 
      name: 'المسار التنفيذي للسفر', 
      rating: 4.8, 
      specialty: 'خدمات الشركات والمؤتمرات', 
      contactEmail: 'corp@executivepath.com', 
      status: 'Active', 
      joinDate: '2022-11-10', 
      contactPerson: 'عمر القحطاني', 
      phone: '013-890-1234', 
      address: 'شارع الظهران، الخبر', 
      notes: 'الخيار الأول لحجوزات الشركات الكبرى.', 
      performanceTier: 'Elite',
      agreementSignedAt: '2022-11-10T09:00:00Z',
      agreementVersion: '2.1',
      bio: 'المسار التنفيذي هو الشريك المفضل للمؤسسات لإدارة رحلات العمل والمؤتمرات. نقدم حلولاً متكاملة لإدارة السفر المؤسسي بكفاءة عالية.',
      galleryImageUrls: [
          'https://picsum.photos/seed/p3-gallery1/800/600',
          'https://picsum.photos/seed/p3-gallery2/800/600'
      ]
  }
];

export const MOCK_FEATURED_OFFERS: FeaturedOffer[] = [
  {
    id: 'FO-1',
    partnerId: 'P-1',
    partnerName: 'وكالة أفق الرفاهية',
    title: 'صيف دبي الفاخر',
    description: 'باقة لمدة 5 أيام في فندق 5 نجوم فاخر مع دخول برج خليفة وجولة سفاري خاصة وعشاء في الصحراء.',
    imageUrl: 'https://picsum.photos/seed/dubai-summer/800/600',
    price: 9500,
    tags: ['صيف', 'عائلات', 'دبي', 'فاخر'],
    requestDetails: {
      from: 'الرياض',
      to: 'دبي',
      departureDate: '2024-08-10',
      returnDate: '2024-08-15',
      travelers: 2,
      tripType: TripType.RoundTrip,
      comfortLevel: ComfortLevel.Luxury,
      tripDescription: 'باقة صيف دبي الفاخرة من وكالة أفق الرفاهية.',
    },
  },
  {
    id: 'FO-2',
    partnerId: 'P-2',
    partnerName: 'سفريات المسافر الذكي',
    title: 'اكتشف سحر القاهرة',
    description: 'رحلة اقتصادية لمدة 4 أيام تشمل الأهرامات، المتحف المصري، وجولة في خان الخليلي.',
    imageUrl: 'https://picsum.photos/seed/cairo-history/800/600',
    price: 2800,
    tags: ['ثقافة', 'اقتصادي', 'القاهرة'],
    requestDetails: {
      from: 'جدة',
      to: 'القاهرة',
      departureDate: '2024-09-05',
      returnDate: '2024-09-09',
      travelers: 1,
      tripType: TripType.RoundTrip,
      comfortLevel: ComfortLevel.Economy,
      tripDescription: 'جولة استكشاف القاهرة من سفريات المسافر الذكي.',
    },
  }
];

const getDateAgo = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
}

export const MOCK_REQUESTS: TravelRequest[] = [
  {
    id: 'TR-1678886400000',
    createdAt: getDateAgo(3),
    updatedAt: getDateAgo(3),
    clientId: 'C-1',
    from: 'الرياض',
    to: 'لندن',
    departureDate: '2024-09-15',
    returnDate: '2024-09-22',
    travelers: 2,
    tripType: TripType.RoundTrip,
    comfortLevel: ComfortLevel.Comfort,
    budget: 25000,
    tripDescription: 'أبحث عن مزيج من التسوق والاسترخاء، مع تجارب طعام فاخرة وزيارة للمعالم الريفية القريبة.',
    preferredHotel: 'فندق قريب من الهايد بارك',
    status: 'new_request',
    offers: [],
    presentedOffers: null,
    finalOffer: null,
    clientPaymentDate: null,
    partnerPayoutDate: null,
    chatHistory: [
        { id: 'msg1', sender: 'Client', text: 'مرحباً، هل يمكن التأكد من أن الفندق يطل على الحديقة؟', timestamp: '10:30 ص' },
        { id: 'msg2', sender: 'Admin', text: 'أهلاً بك أستاذ أحمد! نعم، سنقوم بإدراج هذا الشرط في معايير البحث للوكلاء.', timestamp: '10:32 ص' },
    ],
    partnerChatHistory: [],
    supportMessages: [],
  }
];

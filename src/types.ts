export type CarCategory = 'SUV' | 'Sedan' | 'Hatchback' | 'Picape' | 'Esportivo' | 'Elétrico / Híbrido';

export type FuelType = 'Flex' | 'Gasolina' | 'Diesel' | 'Híbrido' | 'Elétrico';

export type TransmissionType = 'Automático' | 'Manual' | 'CVT' | 'Dupla Embreagem';

export interface CarSpecification {
  motor?: string;
  potencia?: string;
  torque?: string;
  aceleracao0a100?: string;
  velocidadeMaxima?: string;
  consumoUrbano?: string;
  consumoRodoviario?: string;
  tracao?: string;
  portaMalas?: string;
  capacidadeTanque?: string;
  peso?: string;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  storage_path: string;
  public_url: string;
  is_primary: boolean;
  display_order?: number;
  created_at: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  version: string;
  yearFabrication: number;
  yearModel: number;
  price: number;
  fipePrice: number;
  mileage: number;
  category: CarCategory;
  fuel: FuelType;
  transmission: TransmissionType;
  color: string;
  plateEnd?: number;
  doors: number;
  images: string[];
  vehicleImages?: VehicleImage[];
  featured?: boolean;
  isNewArrival?: boolean;
  tags: string[];
  specifications: CarSpecification;
  features: {
    seguranca?: string[];
    conforto?: string[];
    tecnologia?: string[];
  };
  history: {
    laudoCautelar?: '100% Aprovado' | 'Aprovado com Apontamento' | string;
    observacoesLaudo?: string;
    unicoDono?: boolean;
    revisoesNaConcessionaria?: boolean;
    garantiaMeses?: number;
    ipvaPago?: boolean;
  };
  description: string;
}

export interface FilterState {
  searchQuery: string;
  brand: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  transmission: string;
  fuel: string;
  maxMileage: number;
  onlyUniqueOwner: boolean;
  onlyArmor: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'year-desc' | 'km-asc';
}

export interface FinancingSimulation {
  carPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  installmentsCount: number;
  interestRateMonthly: number;
  monthlyInstallment: number;
  totalFinanced: number;
  totalPayable: number;
  estimatedIOF: number;
}

export interface TradeInFormData {
  brand: string;
  model: string;
  year: number;
  km: number;
  transmission: string;
  fuel: string;
  condition: 'Excelente' | 'Bom' | 'Regular';
  hasArmor: boolean;
  plateEnd: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  intendedCarId?: string;
  notes?: string;
}

export interface TestDriveFormData {
  carId: string;
  fullName: string;
  phone: string;
  email: string;
  cnhNumber: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  date: string;
  carPurchased?: string;
  comment: string;
  verified: boolean;
  isGoogleReview?: boolean;
  googleMapsUrl?: string;
  localGuideLevel?: number;
  likesCount?: number;
  reviewPhotos?: string[];
  responseFromOwner?: {
    date: string;
    author: string;
    comment: string;
  };
}

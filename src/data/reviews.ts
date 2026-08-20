import { Review } from '../types';

export const GOOGLE_MAPS_INFO = {
  placeName: 'F2K MOTORS',
  address: 'Rua da Lapa, 201 - Londrina - PR',
  fullAddress: 'Rua da Lapa, 201 - Londrina - PR',
  city: 'Londrina - PR',
  coordinates: {
    lat: -23.3228151,
    lng: -51.165926
  },
  averageRating: 5.0,
  totalReviews: 5,
  ratingBreakdown: {
    fiveStars: 5,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  },
  googleMapsUrl: 'https://www.google.com/maps/place/F2K+MOTORS/@-23.3228151,-51.165926,17z/data=!3m1!4b1!4m6!3m5!1s0x94eb43ed44b4c13b:0xf2794851456a1268!8m2!3d-23.3228151!4d-51.165926!16s%2Fg%2F11zwrthdpv?entry=ttu',
  writeReviewUrl: 'https://www.google.com/maps/place/F2K+MOTORS/@-23.3228151,-51.165926,17z/data=!3m1!4b1!4m6!3m5!1s0x94eb43ed44b4c13b:0xf2794851456a1268!8m2!3d-23.3228151!4d-51.165926!16s%2Fg%2F11zwrthdpv?entry=ttu',
  viewAllReviewsUrl: 'https://www.google.com/maps/place/F2K+MOTORS/@-23.3228151,-51.165926,17z/data=!3m1!4b1!4m6!3m5!1s0x94eb43ed44b4c13b:0xf2794851456a1268!8m2!3d-23.3228151!4d-51.165926!16s%2Fg%2F11zwrthdpv?entry=ttu'
};

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-altair',
    author: 'Altair Palizer',
    role: 'Local Guide · 62 avaliações',
    avatar: 'A',
    rating: 5,
    date: '3 dias atrás',
    comment: 'Show de empresa  Excelência em atendimento pelo Felipe.\nQuer vender ou comprar seu carro. Este é o local em Londrina.',
    verified: true,
    isGoogleReview: true,
    localGuideLevel: 5,
    likesCount: 1,
    googleMapsUrl: GOOGLE_MAPS_INFO.googleMapsUrl
  },
  {
    id: 'rev-sandra',
    author: 'Sandra aparecida da Silva benedito ...',
    role: '4 avaliações',
    avatar: 'S',
    rating: 5,
    date: '3 dias atrás',
    comment: 'Atendimento e acessória do começo ao fim, Perfeito super indicou pois melhor que a compra é o diferenciado atendimento... Fechamento com chave de ouro....\nObrigado Felipe Deus abençoe grandemente 🙏\n\nSandra / Batata',
    verified: true,
    isGoogleReview: true,
    likesCount: 1,
    googleMapsUrl: GOOGLE_MAPS_INFO.googleMapsUrl
  },
  {
    id: 'rev-keliton',
    author: 'Keliton Dos Santos',
    role: '1 avaliação',
    avatar: 'K',
    rating: 5,
    date: '3 dias atrás',
    comment: 'Veículos de qualidade e um ótimo atendimento, honestidade e compromisso com o cliente.',
    verified: true,
    isGoogleReview: true,
    likesCount: 1,
    googleMapsUrl: GOOGLE_MAPS_INFO.googleMapsUrl
  },
  {
    id: 'rev-matheus',
    author: 'Matheus Ferreira',
    role: '3 avaliações',
    avatar: 'M',
    rating: 5,
    date: '3 dias atrás',
    comment: 'Muito bom atendimento.\nE carro de qualidade.\nRecomendo pra todos mundo',
    verified: true,
    isGoogleReview: true,
    likesCount: 1,
    googleMapsUrl: GOOGLE_MAPS_INFO.googleMapsUrl
  },
  {
    id: 'rev-felipe',
    author: 'Felipe Palizer',
    role: '12 avaliações',
    avatar: 'F',
    rating: 5,
    date: '3 dias atrás',
    comment: 'Atendimento nota 10, transparência e confiança total em Londrina.',
    verified: true,
    isGoogleReview: true,
    likesCount: 1,
    googleMapsUrl: GOOGLE_MAPS_INFO.googleMapsUrl
  }
];

export const STORE_STATS = [
  { label: 'Laudo Cautelar', value: '100%', desc: 'Veículos periciados e aprovados' },
  { label: 'Avaliação no Google', value: '5.0 ★', desc: 'Avaliações máximas no Google Maps' },
  { label: 'Inspeção Técnica', value: '150+ Itens', desc: 'Checagem mecânica e estrutural' },
  { label: 'Procedência', value: 'Garantida', desc: 'Sem sinistros ou leilões' }
];

export const STORE_INFO = {
  name: 'F2K MOTORS',
  slogan: 'Seminovos Selecionados & Procedência Garantida',
  address: 'Rua da Lapa, 201 - Londrina - PR',
  fullAddress: 'Rua da Lapa, 201 - Londrina - PR',
  city: 'Londrina - PR',
  phone: '(43) 98417-9361',
  whatsapp: '5543984179361',
  displayWhatsapp: '(43) 98417-9361',
  email: 'contato@f2kmotors.com.br',
  googleMapsUrl: GOOGLE_MAPS_INFO.googleMapsUrl,
  googleReviewsUrl: GOOGLE_MAPS_INFO.googleMapsUrl,
  openingHours: {
    weekdays: 'Seg a Sex: 08:30 às 18:00',
    saturdays: 'Sábados: 08:30 às 13:00',
    sundays: 'Domingos e Feriados: Plantão Digital'
  }
};

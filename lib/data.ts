// This file has been deprecated in favor of static-data-service.ts
// All data now comes from Strapi CMS at build time

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  partnerId: string;
  partnerName: string;
  category: string;
  description: string;
  image: string;
  images: ProductImage[];
  features: Array<{ title: string }>;
  price: string;
  tags: string[];
}

export interface Partner {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  location: string;
  specialties: string[];
  certifications: string[];
  yearFounded: number;
  teamSize: string;
  contact: {
    email: string;
    phone: string;
  };
}

// Empty exports - all data now comes from staticDataService
export const products: Product[] = [];
export const partners: Partner[] = [];
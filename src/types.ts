export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  demoUrl?: string;
  price?: number;
  order: number;
}

export interface PricingPlan {
  id: string;
  title: string;
  price: string;
  features: string[];
  isCustom: boolean;
  order: number;
}

export interface SiteContent {
  heroHeadline: string;
  heroSubtext: string;
  aboutText: string;
}

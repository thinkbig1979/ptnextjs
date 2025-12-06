/**
 * Yacht Transformer
 * Transforms Payload yacht documents to the Yacht type
 */

import type { Yacht } from '../types';
import type { PayloadYachtDocument, PayloadRecord, PayloadLexicalDocument } from './PayloadTypes';
import { transformMediaPath } from './MediaTransformer';
import { transformLexicalToHtml } from './LexicalTransformer';

/**
 * Transforms a Payload yacht document to the Yacht type
 *
 * @param doc - Payload yacht document from database
 * @returns Transformed Yacht object
 */
export function transformYacht(doc: PayloadYachtDocument): Yacht {
  // Transform Lexical description to HTML
  const description = transformLexicalToHtml(doc.description as PayloadLexicalDocument);

  // Transform heroImage (media relationship)
  const heroImage = doc.heroImage?.url ? transformMediaPath(doc.heroImage.url) : undefined;

  // Transform gallery images
  const gallery = doc.gallery?.map((item: PayloadRecord) => {
    if (item.image?.url) {
      return transformMediaPath(item.image.url);
    }
    return null;
  }).filter((url): url is string => url !== null) || [];

  // Transform timeline events
  const timeline = doc.timeline?.map((event: PayloadRecord) => ({
    date: event.date,
    event: event.title || event.event || '',
    description: event.description || '',
    category: event.category || 'milestone',
    location: undefined, // Not in Payload schema
    images: event.image?.url ? [transformMediaPath(event.image.url)] : [],
  })) || [];

  // Transform supplier map with vendor and product relationships
  const supplierMap = doc.supplierMap?.map((supplier: PayloadRecord) => {
    const vendor = supplier.vendor;
    const vendorData = vendor ? {
      id: vendor.id?.toString() || '',
      name: vendor.companyName || vendor.name || '',
      slug: vendor.slug || '',
      logo: vendor.logo?.url ? transformMediaPath(vendor.logo.url) : undefined,
    } : null;

    const products = supplier.products?.map((product: PayloadRecord) => ({
      id: product.id?.toString() || '',
      name: product.name || '',
      slug: product.slug || '',
      image: product.images?.[0]?.url ? transformMediaPath(product.images[0].url) : undefined,
    })) || [];

    return {
      vendorId: vendor?.id?.toString() || '',
      vendorName: vendor?.companyName || vendor?.name || '',
      discipline: supplier.systemCategory || '',
      systems: products.map((p: PayloadRecord) => p.name),
      role: 'primary' as const,
      projectPhase: undefined,
    };
  }) || [];

  // Transform sustainability metrics (flat fields in Payload -> grouped in frontend)
  const sustainabilityScore = (doc.co2EmissionsTonsPerYear || doc.energyEfficiencyRating || doc.hybridPropulsion ||
    doc.solarPanelCapacityKw || doc.batteryStorageKwh || doc.sustainabilityFeatures || doc.greenCertifications) ? {
    co2Emissions: doc.co2EmissionsTonsPerYear,
    energyEfficiency: undefined, // Would need to calculate from rating
    wasteManagement: undefined,
    waterConservation: undefined,
    materialSustainability: undefined,
    overallScore: undefined,
    certifications: doc.greenCertifications?.map((c: PayloadRecord) => c.certification) || [],
  } : undefined;

  // Transform maintenance history with vendor resolution
  const maintenanceHistory = doc.maintenanceHistory?.map((record: PayloadRecord) => {
    const vendor = record.vendor;
    return {
      date: record.date,
      type: record.type || 'routine',
      system: '', // Not in Payload schema
      description: record.description || '',
      vendor: vendor ? vendor.companyName || vendor.name : undefined,
      cost: record.cost,
      nextService: undefined, // Not in Payload schema
      status: 'completed' as const,
    };
  }) || [];

  return {
    id: doc.id.toString(),
    name: doc.name,
    slug: doc.slug,
    description,

    // Images
    image: heroImage,
    images: gallery,

    // Specifications (Payload uses different field names)
    length: doc.lengthMeters,
    beam: doc.beamMeters,
    draft: doc.draftMeters,
    displacement: doc.tonnage,
    builder: doc.builder,
    designer: undefined, // Not in Payload schema
    launchYear: doc.launchYear,
    deliveryYear: doc.deliveryDate ? new Date(doc.deliveryDate).getFullYear() : undefined,
    homePort: undefined, // Not in Payload schema
    flag: doc.flagState,
    classification: doc.classification,

    // Performance (not in Payload schema)
    cruisingSpeed: undefined,
    maxSpeed: undefined,
    range: undefined,

    // Capacity (not in Payload schema)
    guests: undefined,
    crew: undefined,

    // Metadata
    featured: doc.featured || false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,

    // Yacht-specific content
    timeline,
    supplierMap,
    sustainabilityScore,
    customizations: undefined, // Not in Payload schema
    maintenanceHistory,

    // Relations
    category: doc.categories?.[0]?.name || undefined,
    tags: doc.tags?.map((tag: PayloadRecord) => tag.name) || [],

    // Computed fields
    imageUrl: heroImage,
    mainImage: heroImage,
  };
}

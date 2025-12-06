/**
 * Product Transformer
 * Transforms Payload product documents to the Product type
 */

import type {
  Product,
  OwnerReview,
  VisualDemoContent,
  SystemRequirements,
  SystemCompatibility,
} from '../types';
import type { PayloadProductDocument, PayloadRecord, PayloadLexicalDocument } from './PayloadTypes';
import { transformMediaPath } from './MediaTransformer';
import { transformLexicalToHtml, transformLexicalToPlainText } from './LexicalTransformer';
import { transformPayloadVendor } from './VendorTransformer';

/**
 * Transforms a Payload product document to the Product type
 *
 * @param doc - Payload product document from database
 * @returns Transformed Product object
 */
export function transformPayloadProduct(doc: PayloadProductDocument): Product {
  const vendor = doc.vendor;
  const mainImage = doc.images?.find((img: PayloadRecord) => img.isMain) || doc.images?.[0];

  // ============================================================================
  // SECTION 1: COMPARISON METRICS - Convert array to nested object structure
  // ============================================================================
  const comparisonMetrics: { [category: string]: { [key: string]: string | number | boolean } } = {};
  doc.comparisonMetrics?.forEach((metric: PayloadRecord) => {
    const category = metric.category || 'general';
    if (!comparisonMetrics[category]) {
      comparisonMetrics[category] = {};
    }
    comparisonMetrics[category][metric.metricName || 'unknown'] = metric.numericValue || metric.value || '';
  });

  // ============================================================================
  // SECTION 2: INTEGRATION COMPATIBILITY - Extract supported protocols as string array
  // ============================================================================
  const integrationCompatibility = doc.integrationCompatibility?.supportedProtocols?.map((proto: PayloadRecord) => proto.protocol) || [];

  // ============================================================================
  // SECTION 2A: SYSTEM REQUIREMENTS - Transform system requirements object
  // ============================================================================
  const systemRequirements: SystemRequirements | undefined = doc.integrationCompatibility?.systemRequirements ? {
    powerSupply: doc.integrationCompatibility.systemRequirements.powerSupply || undefined,
    mounting: doc.integrationCompatibility.systemRequirements.mounting || undefined,
    operatingTemp: doc.integrationCompatibility.systemRequirements.operatingTemp || undefined,
    certification: doc.integrationCompatibility.systemRequirements.certification || undefined,
    ipRating: doc.integrationCompatibility.systemRequirements.ipRating || undefined,
  } : undefined;

  // ============================================================================
  // SECTION 2B: COMPATIBILITY MATRIX - Transform compatibility matrix array
  // ============================================================================
  const compatibilityMatrix: SystemCompatibility[] = doc.integrationCompatibility?.compatibilityMatrix?.map((item: PayloadRecord) => ({
    system: item.system || '',
    compatibility: item.compatibility || 'none',
    notes: item.notes || undefined,
    requirements: item.requirements?.map((req: PayloadRecord) => req.requirement).filter(Boolean) || undefined,
    complexity: item.complexity || undefined,
    estimatedCost: item.estimatedCost || undefined,
  })) || [];

  // ============================================================================
  // SECTION 3: OWNER REVIEWS ARRAY - Transform Lexical reviewText, resolve yacht relationships
  // ============================================================================
  const ownerReviews: OwnerReview[] = doc.ownerReviews?.map((review: PayloadRecord) => ({
    id: review.id?.toString() || `review-${Date.now()}`,
    productId: doc.id?.toString() || '',
    ownerName: review.reviewerName || '',
    yachtName: review.yachtName || undefined,
    yachtLength: undefined, // Not in Payload schema
    rating: review.overallRating || 0,
    title: review.reviewText ? transformLexicalToPlainText(review.reviewText).substring(0, 100) : '',
    review: transformLexicalToPlainText(review.reviewText),
    pros: review.pros?.map((p: PayloadRecord) => p.pro) || undefined,
    cons: review.cons?.map((c: PayloadRecord) => c.con) || undefined,
    installationDate: undefined, // Not in Payload schema
    verified: review.verified || false,
    helpful: undefined, // Not in Payload schema
    images: undefined, // Not in Payload schema
    useCase: undefined, // Not in Payload schema
    flagged: false,
    vendorResponse: undefined, // Not in Payload schema
  })) || [];

  // ============================================================================
  // SECTION 4: VISUAL DEMO CONTENT - Transform to VisualDemoContent type
  // ============================================================================
  const visualDemo: VisualDemoContent | undefined = doc.visualDemoContent?.model3d?.modelUrl ? {
    type: '3d-model' as const,
    title: doc.name || '',
    description: doc.shortDescription || undefined,
    imageUrl: doc.visualDemoContent?.model3d?.thumbnailImage?.url
      ? transformMediaPath(doc.visualDemoContent.model3d.thumbnailImage.url)
      : undefined,
    modelUrl: doc.visualDemoContent?.model3d?.modelUrl || undefined,
    videoUrl: doc.visualDemoContent?.videoWalkthrough?.videoUrl || undefined,
    hotspots: doc.visualDemoContent?.interactiveHotspots?.flatMap((hotspotGroup: PayloadRecord) =>
      hotspotGroup.hotspots?.map((hotspot: PayloadRecord) => ({
        position: { x: hotspot.x || 0, y: hotspot.y || 0 },
        title: hotspot.title || '',
        description: hotspot.description || undefined,
        action: 'info' as const,
      })) || []
    ) || undefined,
    animations: undefined, // Not in Payload schema
    cameraPositions: undefined, // Not in Payload schema
    materials: undefined, // Not in Payload schema
  } : doc.visualDemoContent?.videoWalkthrough?.videoUrl ? {
    type: 'video' as const,
    title: doc.name || '',
    description: doc.shortDescription || undefined,
    videoUrl: doc.visualDemoContent?.videoWalkthrough?.videoUrl || undefined,
    imageUrl: doc.visualDemoContent?.videoWalkthrough?.thumbnail?.url
      ? transformMediaPath(doc.visualDemoContent.videoWalkthrough.thumbnail.url)
      : undefined,
  } : doc.visualDemoContent?.images360 && doc.visualDemoContent.images360.length > 0 ? {
    type: '360-image' as const,
    title: doc.name || '',
    description: doc.shortDescription || undefined,
    imageUrl: doc.visualDemoContent?.images360?.[0]?.image?.url
      ? transformMediaPath(doc.visualDemoContent.images360[0].image.url)
      : undefined,
  } : undefined;

  return {
    id: doc.id ? doc.id.toString() : '',
    slug: doc.slug || '',
    name: doc.name || '',
    vendorId: vendor?.id?.toString() || '',
    vendorName: vendor?.companyName || vendor?.name || '',
    partnerId: vendor?.id?.toString() || '',
    partnerName: vendor?.companyName || vendor?.name || '',
    category: doc.categories?.[0]?.name || '',
    description: transformLexicalToHtml(doc.description as PayloadLexicalDocument) || '',
    image: transformMediaPath(mainImage?.url || ''),
    images: doc.images?.map((img: PayloadRecord) => ({
      id: img.url,
      url: transformMediaPath(img.url || ''),
      altText: img.altText || '',
      isMain: img.isMain || false,
    })) || [],
    features: doc.features?.map((feature: PayloadRecord) => ({
      id: feature.id || `feature-${Date.now()}`,
      title: feature.title || '',
      description: feature.description || undefined,
      icon: feature.icon || undefined,
      order: feature.order || undefined,
    })) || [],
    price: doc.price,
    tags: [],
    comparisonMetrics,
    specifications: doc.specifications?.map((spec: PayloadRecord) => ({
      label: spec.label,
      value: spec.value,
    })) || [],
    integrationCompatibility,
    systemRequirements,
    compatibilityMatrix,
    ownerReviews,
    visualDemo,
    vendor: vendor ? transformPayloadVendor(vendor) : undefined,
    partner: vendor ? transformPayloadVendor(vendor) : undefined,
  };
}

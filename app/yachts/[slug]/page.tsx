import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { payloadCMSDataService } from '@/lib/payload-cms-data-service';
import { YachtTimelineEvent, YachtCustomization } from '@/lib/types';

// Required for static export
export async function generateStaticParams() {
  try {
    const yachts = await payloadCMSDataService.getYachts();
    return yachts.map((yacht) => ({
      slug: yacht.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for yacht pages:', error);
    return [];
  }
}

export default async function YachtDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const yacht = await payloadCMSDataService.getYachtBySlug(resolvedParams.slug);

    if (!yacht) {
      notFound();
    }

    const allVendors = await payloadCMSDataService.getAllVendors();
    const allProducts = await payloadCMSDataService.getAllProducts();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
              <OptimizedImage
                src={yacht.image || "/images/yachts/yacht-placeholder.jpg"}
                alt={yacht.name}
                fill
                className="object-cover"
                priority
fallbackType="company"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">{yacht.name}</h1>
            <p className="text-lg text-muted-foreground mb-6">{yacht.description}</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yacht.length && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Length:</span>
                  <span>{yacht.length}m</span>
                </div>
              )}
              {yacht.beam && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Beam:</span>
                  <span>{yacht.beam}m</span>
                </div>
              )}
              {yacht.launchYear && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Launch Year:</span>
                  <span>{yacht.launchYear}</span>
                </div>
              )}
              {yacht.builder && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Builder:</span>
                  <span>{yacht.builder}</span>
                </div>
              )}
              {yacht.designer && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Designer:</span>
                  <span>{yacht.designer}</span>
                </div>
              )}
              {yacht.guests && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Guests:</span>
                  <span>{yacht.guests}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Specifications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {yacht.displacement && (
                    <div className="flex justify-between">
                      <span className="font-medium">Displacement:</span>
                      <span>{yacht.displacement} tons</span>
                    </div>
                  )}
                  {yacht.draft && (
                    <div className="flex justify-between">
                      <span className="font-medium">Draft:</span>
                      <span>{yacht.draft}m</span>
                    </div>
                  )}
                  {yacht.cruisingSpeed && (
                    <div className="flex justify-between">
                      <span className="font-medium">Cruising Speed:</span>
                      <span>{yacht.cruisingSpeed} knots</span>
                    </div>
                  )}
                  {yacht.maxSpeed && (
                    <div className="flex justify-between">
                      <span className="font-medium">Max Speed:</span>
                      <span>{yacht.maxSpeed} knots</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {yacht.range && (
                    <div className="flex justify-between">
                      <span className="font-medium">Range:</span>
                      <span>{yacht.range} nm</span>
                    </div>
                  )}
                  {yacht.crew && (
                    <div className="flex justify-between">
                      <span className="font-medium">Crew:</span>
                      <span>{yacht.crew}</span>
                    </div>
                  )}
                  {yacht.homePort && (
                    <div className="flex justify-between">
                      <span className="font-medium">Home Port:</span>
                      <span>{yacht.homePort}</span>
                    </div>
                  )}
                  {yacht.flag && (
                    <div className="flex justify-between">
                      <span className="font-medium">Flag:</span>
                      <span>{yacht.flag}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          {yacht.images && yacht.images.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yacht.images.map((image: string, index: number) => (
                    <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                      <OptimizedImage
                        src={image}
                        alt={`${yacht.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
        fallbackType="company"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {yacht.timeline && yacht.timeline.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {yacht.timeline.map((event: YachtTimelineEvent, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{event.event}</h3>
                        {event.date && (
                          <Badge variant="secondary">{event.date}</Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Location:</span> {event.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator className="my-8" />

          {/* Supplier Network - Organized by system categories */}
          {yacht.supplierMap && yacht.supplierMap.length > 0 && (() => {
            // Filter to only include suppliers that exist on our platform
            const platformSuppliers = yacht.supplierMap.filter((supplier: any) =>
              allVendors.some((vendor: any) =>
                vendor.id === supplier.vendorId ||
                vendor.name.toLowerCase() === supplier.vendorName?.toLowerCase()
              )
            );

            if (platformSuppliers.length === 0) {
              return (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <span className="text-accent font-semibold text-sm">🔗</span>
                      </div>
                      Supplier Network
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Vendors from our platform who supplied systems for this yacht
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No suppliers from our platform are currently listed for this yacht.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Group suppliers by discipline/category
            const suppliersByCategory = platformSuppliers.reduce((acc: any, supplier: any) => {
              const category = supplier.discipline || 'Other';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(supplier);
              return acc;
            }, {});

            return (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">🔗</span>
                    </div>
                    Supplier Network
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Vendors from our platform who supplied systems for this yacht, organized by category
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {Object.entries(suppliersByCategory).map(([category, suppliers]: [string, any]) => (
                      <div key={category} className="group">
                        {/* Enhanced Category Header */}
                        <div className="relative mb-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-accent to-accent/80 rounded-md flex items-center justify-center">
                              <span className="text-accent-foreground font-bold text-xs">⚡</span>
                            </div>
                            <h3 className="text-xl font-cormorant font-bold text-foreground tracking-tight">
                              {category}
                            </h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-accent/30 to-transparent"></div>
                          </div>
                          <div className="absolute -bottom-1 left-9 w-16 h-0.5 bg-accent rounded-full"></div>
                        </div>

                        {/* Suppliers Grid */}
                        <div className="grid gap-4">
                          {suppliers.map((supplier: any, index: number) => {
                            // Find the matching vendor from our platform
                            const vendor = allVendors.find((v: any) =>
                              v.id === supplier.vendorId ||
                              v.name.toLowerCase() === supplier.vendorName?.toLowerCase()
                            );

                            return (
                              <div key={index} className="group/supplier relative border border-border/50 rounded-xl p-6 bg-gradient-to-br from-card to-muted/10 hover:border-accent/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                                {/* Vendor Name Section */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-8 bg-gradient-to-b from-accent to-accent/60 rounded-full"></div>
                                    <div>
                                      <h4 className="text-xl font-poppins font-bold leading-tight">
                                        {vendor ? (
                                          <Link
                                            href={`/vendors/${vendor.slug}`}
                                            className="text-foreground hover:text-accent transition-colors duration-200 relative group/link"
                                          >
                                            {supplier.vendorName}
                                            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-accent transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-200 origin-left"></span>
                                          </Link>
                                        ) : (
                                          <span className="text-foreground">{supplier.vendorName}</span>
                                        )}
                                      </h4>
                                      {vendor?.location && (
                                        <p className="text-sm text-muted-foreground font-poppins-light">
                                          📍 {vendor.location}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Enhanced Role Badge */}
                                  {supplier.role && (
                                    <Badge
                                      variant={
                                        supplier.role === 'primary' ? 'default' :
                                        supplier.role === 'subcontractor' ? 'secondary' : 'outline'
                                      }
                                      className={`
                                        text-xs font-poppins-medium px-3 py-1
                                        ${supplier.role === 'primary' ? 'bg-accent text-accent-foreground border-accent hover:bg-accent/90' : ''}
                                        ${supplier.role === 'subcontractor' ? 'hover:bg-secondary/80' : ''}
                                        transition-colors duration-200
                                      `}
                                    >
                                      {supplier.role.charAt(0).toUpperCase() + supplier.role.slice(1)}
                                    </Badge>
                                  )}
                                </div>

                                {/* Systems/Products supplied */}
                                {supplier.systems && supplier.systems.length > 0 && (
                                  <div className="space-y-3 pl-6">
                                    <div className="text-sm font-poppins-medium text-muted-foreground mb-2">
                                      Systems & Products:
                                    </div>
                                    {supplier.systems.map((system: string, sysIndex: number) => {
                                      // Try to find matching products for this system
                                      const matchingProducts = allProducts.filter((product: any) =>
                                        (product.vendorId === supplier.vendorId ||
                                         product.vendorName?.toLowerCase() === supplier.vendorName?.toLowerCase()) &&
                                        (product.name.toLowerCase().includes(system.toLowerCase()) ||
                                         product.category?.toLowerCase().includes(system.toLowerCase()) ||
                                         system.toLowerCase().includes(product.name.toLowerCase()))
                                      );

                                      if (matchingProducts.length > 0) {
                                        return (
                                          <div key={sysIndex} className="flex items-start gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="space-y-1">
                                              <div className="flex flex-wrap gap-1">
                                                {matchingProducts.map((product: any, pIndex: number) => (
                                                  <span key={pIndex} className="inline-flex items-center">
                                                    <Link
                                                      href={`/products/${product.slug}`}
                                                      className="text-foreground hover:text-accent hover:underline transition-colors duration-200 font-poppins-medium"
                                                    >
                                                      {product.name}
                                                    </Link>
                                                    {pIndex < matchingProducts.length - 1 && <span className="text-muted-foreground mx-1">•</span>}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={sysIndex} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full flex-shrink-0"></div>
                                            <span className="text-foreground font-poppins-light">{system}</span>
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                )}

                                {/* Project phase info */}
                                {supplier.projectPhase && (
                                  <div className="mt-4 pt-3 border-t border-border/30">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-poppins-medium text-muted-foreground">Project Phase:</span>
                                      <Badge variant="outline" className="text-xs bg-secondary/30">
                                        {supplier.projectPhase}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                {/* Hover accent line */}
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent to-accent/0 transform scale-x-0 group-hover/supplier:scale-x-100 transition-transform duration-300 origin-center"></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Sustainability Information */}
          {yacht.sustainabilityScore && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sustainability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {yacht.sustainabilityScore.overallScore || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {yacht.sustainabilityScore.energyEfficiency || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Energy Efficiency (kWh/nm)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {yacht.sustainabilityScore.co2Emissions || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">CO2 Emissions (kg)</p>
                  </div>
                </div>
                {yacht.sustainabilityScore.certifications && yacht.sustainabilityScore.certifications.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {yacht.sustainabilityScore.certifications.map((cert: string, index: number) => (
                        <Badge key={index} variant="outline">{cert}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customizations */}
          {yacht.customizations && yacht.customizations.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Custom Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {yacht.customizations.map((customization: YachtCustomization, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{customization.category}</h4>
                      {customization.description && (
                        <p className="text-sm text-muted-foreground mb-2">{customization.description}</p>
                      )}
                      {customization.vendor && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Vendor:</span> {customization.vendor}
                        </p>
                      )}
                      {customization.cost && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Investment:</span> {customization.cost}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading yacht:', error);
    notFound();
  }
}
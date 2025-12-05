'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Image as ImageIcon, Video, X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaGalleryItem } from '@/lib/types';

interface VendorMediaGalleryProps {
  mediaGallery?: MediaGalleryItem[];
  vendorName: string;
  vendorTier?: 'free' | 'tier1' | 'tier2' | 'tier3';
}

export function VendorMediaGallery({ mediaGallery, vendorName, vendorTier }: VendorMediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaGalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [activeAlbum, setActiveAlbum] = useState<string>('all');

  // Hide media gallery for Free tier - Media Gallery is Tier1+ feature
  if (!vendorTier || vendorTier === 'free') {
    return null;
  }

  if (!mediaGallery || mediaGallery.length === 0) {
    return null;
  }

  // Sort media items by order
  const sortedItems = [...mediaGallery].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Get unique albums
  const albums = Array.from(new Set(sortedItems.map(item => item.album).filter(Boolean))) as string[];

  // Filter items by album
  const filteredItems = activeAlbum === 'all'
    ? sortedItems
    : sortedItems.filter(item => item.album === activeAlbum);

  // Get image items for lightbox navigation
  const imageItems = filteredItems.filter(item => item.type === 'image');

  /**
   * Open lightbox for image viewing
   */
  const handleOpenLightbox = (item: MediaGalleryItem) => {
    if (item.type === 'image') {
      const index = imageItems.findIndex(img => img.id === item.id);
      setLightboxIndex(index);
    }
    setSelectedItem(item);
  };

  /**
   * Navigate to next image in lightbox
   */
  const handleNextImage = () => {
    if (lightboxIndex < imageItems.length - 1) {
      const nextIndex = lightboxIndex + 1;
      setLightboxIndex(nextIndex);
      setSelectedItem(imageItems[nextIndex]);
    }
  };

  /**
   * Navigate to previous image in lightbox
   */
  const handlePreviousImage = () => {
    if (lightboxIndex > 0) {
      const prevIndex = lightboxIndex - 1;
      setLightboxIndex(prevIndex);
      setSelectedItem(imageItems[prevIndex]);
    }
  };

  /**
   * Handle keyboard navigation in lightbox
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'ArrowLeft') {
      handlePreviousImage();
    } else if (e.key === 'Escape') {
      setSelectedItem(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Gallery
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Album Tabs */}
          {albums.length > 0 && (
            <Tabs value={activeAlbum} onValueChange={setActiveAlbum}>
              <TabsList>
                <TabsTrigger value="all">All ({sortedItems.length})</TabsTrigger>
                {albums.map(album => {
                  const count = sortedItems.filter(item => item.album === album).length;
                  return (
                    <TabsTrigger key={album} value={album}>
                      {album} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOpenLightbox(item)}
              >
                {/* Media Preview */}
                <div className="aspect-video bg-muted relative">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.altText || item.caption || `${vendorName} media`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/80">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.caption || 'Video thumbnail'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Video className="h-12 w-12 text-white" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 rounded-full p-4">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="gap-1">
                      {item.type === 'image' ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                      {item.type === 'image' ? 'Image' : 'Video'}
                    </Badge>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium">
                      {item.type === 'image' ? 'Click to view' : 'Click to play'}
                    </p>
                  </div>
                </div>

                {/* Caption */}
                {item.caption && (
                  <div className="p-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No media in this album</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent
          className="max-w-4xl w-full p-0"
          onKeyDown={handleKeyDown}
        >
          {selectedItem && (
            <div className="relative bg-black">
              {/* Close Button */}
              <DialogClose className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors">
                <X className="h-5 w-5 text-white" />
                <span className="sr-only">Close</span>
              </DialogClose>

              {/* Navigation Buttons (Images only) */}
              {selectedItem.type === 'image' && imageItems.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full disabled:opacity-30"
                    onClick={handlePreviousImage}
                    disabled={lightboxIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Previous image</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full disabled:opacity-30"
                    onClick={handleNextImage}
                    disabled={lightboxIndex === imageItems.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Next image</span>
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {lightboxIndex + 1} / {imageItems.length}
                  </div>
                </>
              )}

              {/* Media Content */}
              <div className="w-full">
                {selectedItem.type === 'image' ? (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.altText || selectedItem.caption || `${vendorName} media`}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                ) : (
                  <div className="aspect-video w-full">
                    <iframe
                      src={selectedItem.url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedItem.caption || 'Video'}
                    />
                  </div>
                )}

                {/* Media Info */}
                {selectedItem.caption && (
                  <div className="p-6 bg-background">
                    <p className="text-sm text-foreground">
                      {selectedItem.caption}
                    </p>
                    {selectedItem.album && (
                      <Badge variant="outline" className="mt-2">
                        {selectedItem.album}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

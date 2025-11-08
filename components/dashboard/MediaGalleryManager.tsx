'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  Loader2,
  X,
  FileImage,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { useTierAccess } from '@/hooks/useTierAccess';
import { UpgradePromptCard } from './UpgradePromptCard';
import { uploadFile } from '@/lib/utils/file-upload';
import type { MediaGalleryItem, MediaGalleryItemType, Vendor } from '@/lib/types';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CAPTION_LENGTH = 500;
const MAX_ALT_TEXT_LENGTH = 255;
const MAX_ALBUM_LENGTH = 255;

interface MediaGalleryManagerProps {
  vendor: Vendor;
  onSubmit: (data: Partial<Vendor>) => Promise<void>;
}

interface MediaItemFormData {
  type: MediaGalleryItemType;
  file?: File;
  videoUrl?: string;
  caption?: string;
  altText?: string;
  album?: string;
}

export function MediaGalleryManager({ vendor, onSubmit }: MediaGalleryManagerProps) {
  const [mediaItems, setMediaItems] = useState<MediaGalleryItem[]>(vendor.mediaGallery || []);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaGalleryItem | null>(null);
  const [formData, setFormData] = useState<MediaItemFormData>({ type: 'image' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { markDirty } = useVendorDashboard();
  const { hasAccess, tier, upgradePath } = useTierAccess('media-gallery', vendor?.tier);

  // Get unique albums from media items
  const albums = Array.from(new Set(mediaItems.map(item => item.album).filter(Boolean))) as string[];

  // Filter media items by selected album
  const filteredItems = selectedAlbum === 'all'
    ? mediaItems
    : mediaItems.filter(item => item.album === selectedAlbum);

  /**
   * Validate image file
   */
  const validateImageFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images';
    }

    if (file.size > MAX_IMAGE_SIZE) {
      const maxSizeMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${fileSizeMB}MB) exceeds maximum limit of ${maxSizeMB}MB`;
    }

    return null;
  }, []);

  /**
   * Parse video URL and extract platform info
   */
  const parseVideoUrl = useCallback((url: string): { platform: 'youtube' | 'vimeo' | null; embedUrl: string | null; thumbnailUrl: string | null } => {
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      return {
        platform: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        thumbnailUrl: null // Vimeo requires API call for thumbnail
      };
    }

    return { platform: null, embedUrl: null, thumbnailUrl: null };
  }, []);

  /**
   * Handle file selection from drag-drop or browse
   */
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      toast.error('Invalid file', { description: validationError });
      return;
    }

    setFormData(prev => ({ ...prev, file, type: 'image' }));
    setError(null);
    setIsAddDialogOpen(true);
  }, [validateImageFile]);

  /**
   * Handle drag and drop events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  /**
   * Trigger file input click
   */
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Upload image to Payload Media API
   */
  const uploadImage = useCallback(async (file: File): Promise<{ url: string; filename: string }> => {
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    const response = await uploadFile({
      url: '/api/media/upload',
      file,
      onProgress: (progress) => {
        // Could add progress indicator here if needed
        console.log('Upload progress:', progress.percentage);
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return {
      url: data.url,
      filename: file.name
    };
  }, []);

  /**
   * Add new media item
   */
  const handleAddMediaItem = useCallback(async () => {
    try {
      setUploading(true);
      setError(null);

      let newItem: MediaGalleryItem;

      if (formData.type === 'image' && formData.file) {
        // Upload image
        const { url, filename } = await uploadImage(formData.file);
        newItem = {
          id: `img-${Date.now()}`,
          type: 'image',
          url,
          filename,
          caption: formData.caption,
          altText: formData.altText,
          album: formData.album,
          order: mediaItems.length,
          uploadedAt: new Date().toISOString()
        };
      } else if (formData.type === 'video' && formData.videoUrl) {
        // Parse video URL
        const { platform, embedUrl, thumbnailUrl } = parseVideoUrl(formData.videoUrl);

        if (!platform || !embedUrl) {
          throw new Error('Invalid video URL. Please use YouTube or Vimeo links');
        }

        newItem = {
          id: `vid-${Date.now()}`,
          type: 'video',
          url: embedUrl,
          caption: formData.caption,
          album: formData.album,
          order: mediaItems.length,
          videoPlatform: platform,
          thumbnailUrl: thumbnailUrl || undefined,
          uploadedAt: new Date().toISOString()
        };
      } else {
        throw new Error('Please select an image or provide a video URL');
      }

      const updatedItems = [...mediaItems, newItem];
      setMediaItems(updatedItems);
      markDirty(true);

      toast.success('Media added', {
        description: `${formData.type === 'image' ? 'Image' : 'Video'} added successfully`
      });

      // Reset form and close dialog
      setFormData({ type: 'image' });
      setIsAddDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Add media error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add media';
      setError(errorMessage);
      toast.error('Failed to add media', { description: errorMessage });
    } finally {
      setUploading(false);
    }
  }, [formData, mediaItems, parseVideoUrl, markDirty, uploadImage]);

  /**
   * Edit existing media item
   */
  const handleEditMediaItem = useCallback(async () => {
    if (!editingItem) return;

    try {
      setUploading(true);
      setError(null);

      const updatedItems = mediaItems.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            caption: formData.caption,
            altText: formData.altText,
            album: formData.album
          };
        }
        return item;
      });

      setMediaItems(updatedItems);
      markDirty(true);

      toast.success('Media updated', {
        description: 'Media item updated successfully'
      });

      setEditingItem(null);
      setFormData({ type: 'image' });
      setIsEditDialogOpen(false);

    } catch (error) {
      console.error('Edit media error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update media';
      setError(errorMessage);
      toast.error('Failed to update media', { description: errorMessage });
    } finally {
      setUploading(false);
    }
  }, [editingItem, formData, mediaItems, markDirty]);

  /**
   * Delete media item
   */
  const handleDeleteMediaItem = useCallback((itemId: string) => {
    const updatedItems = mediaItems.filter(item => item.id !== itemId);
    setMediaItems(updatedItems);
    markDirty(true);
    toast.success('Media deleted', {
      description: 'Media item removed from gallery'
    });
  }, [mediaItems, markDirty]);

  /**
   * Open edit dialog with existing item data
   */
  const handleOpenEditDialog = useCallback((item: MediaGalleryItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      caption: item.caption,
      altText: item.altText,
      album: item.album
    });
    setIsEditDialogOpen(true);
  }, []);

  /**
   * Save changes to vendor profile
   */
  const handleSaveChanges = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      await onSubmit({ mediaGallery: mediaItems });

      toast.success('Changes saved', {
        description: 'Media gallery updated successfully'
      });

    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      setError(errorMessage);
      toast.error('Failed to save changes', { description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  }, [mediaItems, onSubmit]);

  // Show upgrade prompt for users without access
  if (!hasAccess) {
    return (
      <UpgradePromptCard
        currentTier={tier}
        targetTier={upgradePath}
        feature="Media Gallery"
        benefits={[
          'Upload and organize images into albums',
          'Embed YouTube and Vimeo videos',
          'Showcase your work with visual galleries',
          'Improve vendor profile engagement',
          'Professional media management tools'
        ]}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Gallery
          </CardTitle>
          <CardDescription>
            Upload images and add videos to showcase your work
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Album Filter */}
          {albums.length > 0 && (
            <div className="flex items-center gap-4">
              <Label htmlFor="album-filter" className="whitespace-nowrap">Filter by album:</Label>
              <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                <SelectTrigger id="album-filter" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Albums</SelectItem>
                  {albums.map(album => (
                    <SelectItem key={album} value={album}>
                      {album}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{filteredItems.length} items</Badge>
            </div>
          )}

          {/* Drag-Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
            onClick={handleBrowseClick}
          >
            <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drop images here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPEG, PNG, WebP, GIF (max 10MB per file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFormData({ type: 'image' }); setIsAddDialogOpen(true); }}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFormData({ type: 'video' }); setIsAddDialogOpen(true); }}>
                <Video className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="group relative border rounded-lg overflow-hidden">
                  {/* Media Preview */}
                  <div className="aspect-video bg-muted relative">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.altText || item.caption || 'Gallery image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/80">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.caption || 'Video thumbnail'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-12 w-12 text-white" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-16 w-16 text-white/90" />
                        </div>
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMediaItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Media Info */}
                  <div className="p-3 space-y-1">
                    {item.album && (
                      <Badge variant="outline" className="text-xs">
                        {item.album}
                      </Badge>
                    )}
                    {item.caption && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No media items yet</p>
              <p className="text-sm">Upload images or add videos to get started</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {mediaItems.length} media item{mediaItems.length !== 1 ? 's' : ''} in gallery
          </p>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Add Media Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Media Item</DialogTitle>
            <DialogDescription>
              {formData.type === 'image' ? 'Upload an image file' : 'Add a video from YouTube or Vimeo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Media Type Selector */}
            <div className="space-y-2">
              <Label>Media Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: MediaGalleryItemType) => setFormData({ ...formData, type: value, file: undefined, videoUrl: undefined })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video (YouTube/Vimeo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            {formData.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="image-file">Image File</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData({ ...formData, file });
                  }}
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    {formData.file.name} ({(formData.file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            )}

            {/* Video URL */}
            {formData.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a YouTube or Vimeo video URL
                </p>
              </div>
            )}

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Textarea
                id="caption"
                placeholder="Describe this media item..."
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                maxLength={MAX_CAPTION_LENGTH}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.caption?.length || 0} / {MAX_CAPTION_LENGTH}
              </p>
            </div>

            {/* Alt Text (Images only) */}
            {formData.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="alt-text">Alt Text (optional)</Label>
                <Input
                  id="alt-text"
                  placeholder="Descriptive text for accessibility"
                  value={formData.altText || ''}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  maxLength={MAX_ALT_TEXT_LENGTH}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.altText?.length || 0} / {MAX_ALT_TEXT_LENGTH}
                </p>
              </div>
            )}

            {/* Album */}
            <div className="space-y-2">
              <Label htmlFor="album">Album (optional)</Label>
              <Input
                id="album"
                placeholder="e.g., Projects, Products, Events"
                value={formData.album || ''}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                maxLength={MAX_ALBUM_LENGTH}
                list="existing-albums"
              />
              {albums.length > 0 && (
                <datalist id="existing-albums">
                  {albums.map(album => (
                    <option key={album} value={album} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleAddMediaItem} disabled={uploading || (formData.type === 'image' && !formData.file) || (formData.type === 'video' && !formData.videoUrl)}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Media Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media Item</DialogTitle>
            <DialogDescription>
              Update caption, alt text, and album information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="edit-caption">Caption (optional)</Label>
              <Textarea
                id="edit-caption"
                placeholder="Describe this media item..."
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                maxLength={MAX_CAPTION_LENGTH}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.caption?.length || 0} / {MAX_CAPTION_LENGTH}
              </p>
            </div>

            {/* Alt Text (Images only) */}
            {editingItem?.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="edit-alt-text">Alt Text (optional)</Label>
                <Input
                  id="edit-alt-text"
                  placeholder="Descriptive text for accessibility"
                  value={formData.altText || ''}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  maxLength={MAX_ALT_TEXT_LENGTH}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.altText?.length || 0} / {MAX_ALT_TEXT_LENGTH}
                </p>
              </div>
            )}

            {/* Album */}
            <div className="space-y-2">
              <Label htmlFor="edit-album">Album (optional)</Label>
              <Input
                id="edit-album"
                placeholder="e.g., Projects, Products, Events"
                value={formData.album || ''}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                maxLength={MAX_ALBUM_LENGTH}
                list="existing-albums-edit"
              />
              {albums.length > 0 && (
                <datalist id="existing-albums-edit">
                  {albums.map(album => (
                    <option key={album} value={album} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleEditMediaItem} disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

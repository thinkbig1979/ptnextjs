'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { HelpTooltip } from '@/components/help';
import type { MediaGalleryItemType } from '@/lib/types';

const MAX_CAPTION_LENGTH = 500;
const MAX_ALT_TEXT_LENGTH = 255;
const MAX_ALBUM_LENGTH = 255;

export interface MediaItemFormData {
  type: MediaGalleryItemType;
  file?: File;
  videoUrl?: string;
  caption?: string;
  altText?: string;
  album?: string;
}

interface MediaItemFormDialogProps {
  mode: 'add' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: MediaItemFormData;
  onFormDataChange: (data: MediaItemFormData) => void;
  onSubmit: () => void;
  uploading: boolean;
  albums: string[];
  showAltText: boolean;
}

export function MediaItemFormDialog({
  mode,
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  uploading,
  albums,
  showAltText,
}: MediaItemFormDialogProps) {
  const isAdd = mode === 'add';
  const idPrefix = isAdd ? '' : 'edit-';
  const datalistId = isAdd ? 'existing-albums' : 'existing-albums-edit';

  const isSubmitDisabled = uploading
    || (isAdd && formData.type === 'image' && !formData.file)
    || (isAdd && formData.type === 'video' && !formData.videoUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAdd ? 'Add Media Item' : 'Edit Media Item'}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? formData.type === 'image'
                ? 'Upload an image file'
                : 'Add a video from YouTube or Vimeo'
              : 'Update caption, alt text, and album information'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isAdd && (
            <>
              <div className="space-y-2">
                <Label>Media Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MediaGalleryItemType) =>
                    onFormDataChange({ ...formData, type: value, file: undefined, videoUrl: undefined })
                  }
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

              {formData.type === 'image' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="image-file">Image File</Label>
                    <HelpTooltip
                      content="Upload JPEG, PNG, WebP, or GIF images (max 10MB). Use high-quality photos."
                      title="Image Upload"
                    />
                  </div>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFormDataChange({ ...formData, file });
                    }}
                  />
                  {formData.file && (
                    <p className="text-sm text-muted-foreground">
                      {formData.file.name} ({(formData.file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              )}

              {formData.type === 'video' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <HelpTooltip
                      content="Paste a YouTube or Vimeo URL to embed a video in your gallery."
                      title="Video URL"
                    />
                  </div>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl || ''}
                    onChange={(e) => onFormDataChange({ ...formData, videoUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a YouTube or Vimeo video URL
                  </p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}caption`}>Caption (optional)</Label>
            <Textarea
              id={`${idPrefix}caption`}
              placeholder="Describe this media item..."
              value={formData.caption || ''}
              onChange={(e) => onFormDataChange({ ...formData, caption: e.target.value })}
              maxLength={MAX_CAPTION_LENGTH}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.caption?.length || 0} / {MAX_CAPTION_LENGTH}
            </p>
          </div>

          {showAltText && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={`${idPrefix}alt-text`}>Alt Text (optional)</Label>
                <HelpTooltip
                  content="Describe the image for accessibility and SEO. Screen readers use this text."
                  title="Alt Text"
                />
              </div>
              <Input
                id={`${idPrefix}alt-text`}
                placeholder="Descriptive text for accessibility"
                value={formData.altText || ''}
                onChange={(e) => onFormDataChange({ ...formData, altText: e.target.value })}
                maxLength={MAX_ALT_TEXT_LENGTH}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.altText?.length || 0} / {MAX_ALT_TEXT_LENGTH}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}album`}>Album (optional)</Label>
            <Input
              id={`${idPrefix}album`}
              placeholder="e.g., Projects, Products, Events"
              value={formData.album || ''}
              onChange={(e) => onFormDataChange({ ...formData, album: e.target.value })}
              maxLength={MAX_ALBUM_LENGTH}
              list={datalistId}
            />
            {albums.length > 0 && (
              <datalist id={datalistId}>
                {albums.map(album => (
                  <option key={album} value={album} />
                ))}
              </datalist>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitDisabled}>
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAdd ? 'Add Media' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

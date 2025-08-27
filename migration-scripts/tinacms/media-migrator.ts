#!/usr/bin/env ts-node

/**
 * Media Migration Helper for TinaCMS Migration - Milestone 3
 * 
 * Handles downloading, optimization, and organization of media files from Strapi URLs
 * Generates placeholder images when originals are unavailable
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';

interface MediaFile {
  id: string;
  originalUrl: string;
  localPath: string;
  type: 'image' | 'document' | 'video';
  category: 'partner' | 'product' | 'blog' | 'team' | 'company' | 'system';
  subCategory?: 'logo' | 'image' | 'headshot' | 'post' | 'icon' | 'placeholder';
  altText?: string;
  caption?: string;
}

interface MediaMigrationConfig {
  sourceBaseUrl: string;
  mediaOutputPath: string;
  generatePlaceholders: boolean;
  optimizeImages: boolean;
  downloadTimeout: number;
  maxFileSize: number;
  allowedExtensions: string[];
}

interface MediaMigrationReport {
  timestamp: string;
  totalFiles: number;
  downloadedFiles: number;
  generatedPlaceholders: number;
  failedFiles: number;
  errors: string[];
  filesByCategory: { [category: string]: number };
}

class MediaMigrator {
  private config: MediaMigrationConfig;
  private report: MediaMigrationReport;

  constructor(config: MediaMigrationConfig) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      totalFiles: 0,
      downloadedFiles: 0,
      generatedPlaceholders: 0,
      failedFiles: 0,
      errors: [],
      filesByCategory: {}
    };
  }

  /**
   * Migrate all media files from URL list
   */
  async migrateMedia(mediaFiles: MediaFile[]): Promise<MediaMigrationReport> {
    console.log(`🖼️ Starting media migration for ${mediaFiles.length} files`);
    
    this.report.totalFiles = mediaFiles.length;

    // Create media directory structure
    await this.createMediaDirectories();

    // Process files in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < mediaFiles.length; i += batchSize) {
      const batch = mediaFiles.slice(i, i + batchSize);
      await Promise.all(batch.map(file => this.processMediaFile(file)));
    }

    // Generate missing placeholders
    if (this.config.generatePlaceholders) {
      await this.generatePlaceholderImages();
    }

    console.log(`✅ Media migration completed: ${this.report.downloadedFiles}/${this.report.totalFiles} files`);
    return this.report;
  }

  /**
   * Create media directory structure
   */
  private async createMediaDirectories(): Promise<void> {
    const directories = [
      'partners/logos',
      'partners/images',
      'partners/placeholders',
      'products/images',
      'products/placeholders',
      'blog/posts',
      'blog/inline',
      'blog/placeholders',
      'team/headshots',
      'team/placeholders',
      'company/logos',
      'company/brand',
      'company/social',
      'categories/icons',
      'categories/placeholders',
      'system/icons',
      'system/placeholders',
      'system/optimized'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.config.mediaOutputPath, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * Process individual media file
   */
  private async processMediaFile(mediaFile: MediaFile): Promise<void> {
    try {
      console.log(`📥 Processing: ${mediaFile.originalUrl}`);
      
      // Check if file already exists
      const exists = await this.fileExists(mediaFile.localPath);
      if (exists) {
        console.log(`⏭️ Skipping existing file: ${path.basename(mediaFile.localPath)}`);
        this.report.downloadedFiles++;
        return;
      }

      // Validate URL and extension
      if (!this.isValidMediaUrl(mediaFile.originalUrl)) {
        throw new Error(`Invalid media URL: ${mediaFile.originalUrl}`);
      }

      // Download the file
      const success = await this.downloadFile(mediaFile.originalUrl, mediaFile.localPath);
      
      if (success) {
        // Optimize if needed
        if (this.config.optimizeImages && this.isImageFile(mediaFile.localPath)) {
          await this.optimizeImage(mediaFile.localPath);
        }
        
        this.report.downloadedFiles++;
        this.incrementCategoryCount(mediaFile.category);
        
        console.log(`✅ Downloaded: ${path.basename(mediaFile.localPath)}`);
      } else {
        throw new Error('Download failed');
      }
      
    } catch (error) {
      const errorMessage = `Failed to process ${mediaFile.originalUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.report.errors.push(errorMessage);
      this.report.failedFiles++;
      
      console.error(`❌ ${errorMessage}`);
      
      // Generate placeholder if download failed
      if (this.config.generatePlaceholders) {
        await this.generatePlaceholderForFile(mediaFile);
      }
    }
  }

  /**
   * Download file from URL
   */
  private downloadFile(url: string, localPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const request = protocol.get(url, {
          timeout: this.config.downloadTimeout,
          headers: {
            'User-Agent': 'TinaCMS-MediaMigrator/1.0'
          }
        }, (response) => {
          if (response.statusCode === 200) {
            const fileStream = fs.createWriteStream(localPath);
            let downloadedBytes = 0;
            
            response.on('data', (chunk) => {
              downloadedBytes += chunk.length;
              if (downloadedBytes > this.config.maxFileSize) {
                request.abort();
                fs.unlink(localPath).catch(() => {}); // Clean up
                resolve(false);
                return;
              }
            });
            
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
              fileStream.close();
              resolve(true);
            });
            
            fileStream.on('error', () => {
              fs.unlink(localPath).catch(() => {}); // Clean up
              resolve(false);
            });
            
          } else if (response.statusCode === 302 || response.statusCode === 301) {
            // Handle redirects
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              this.downloadFile(redirectUrl, localPath).then(resolve);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        });
        
        request.on('error', () => resolve(false));
        request.on('timeout', () => {
          request.abort();
          resolve(false);
        });
        
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate media URL
   */
  private isValidMediaUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const extension = path.extname(parsedUrl.pathname).toLowerCase();
      return this.config.allowedExtensions.includes(extension);
    } catch {
      return false;
    }
  }

  /**
   * Check if file is an image
   */
  private isImageFile(filePath: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const extension = path.extname(filePath).toLowerCase();
    return imageExtensions.includes(extension);
  }

  /**
   * Optimize image (placeholder for actual optimization)
   */
  private async optimizeImage(filePath: string): Promise<void> {
    // This is a placeholder for image optimization
    // In a production environment, you might use libraries like Sharp or ImageMagick
    console.log(`🔄 Image optimization placeholder for: ${path.basename(filePath)}`);
    
    // For now, just verify the file is valid
    try {
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        await fs.unlink(filePath);
        throw new Error('Empty file detected and removed');
      }
    } catch (error) {
      throw new Error(`Invalid image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate placeholder images for missing files
   */
  private async generatePlaceholderImages(): Promise<void> {
    console.log('🎨 Generating placeholder images...');
    
    const placeholders = [
      { path: 'system/placeholders/image-placeholder.svg', type: 'image' },
      { path: 'system/placeholders/logo-placeholder.svg', type: 'logo' },
      { path: 'system/placeholders/avatar-placeholder.svg', type: 'avatar' }
    ];

    for (const placeholder of placeholders) {
      const fullPath = path.join(this.config.mediaOutputPath, placeholder.path);
      const exists = await this.fileExists(fullPath);
      
      if (!exists) {
        const svg = this.generateSVGPlaceholder(placeholder.type);
        await fs.writeFile(fullPath, svg, 'utf-8');
        this.report.generatedPlaceholders++;
        console.log(`✅ Generated placeholder: ${placeholder.path}`);
      }
    }

    // Generate category-specific placeholders
    await this.generateCategoryPlaceholders();
  }

  /**
   * Generate placeholder for specific failed file
   */
  private async generatePlaceholderForFile(mediaFile: MediaFile): Promise<void> {
    const placeholderPath = this.getPlaceholderPath(mediaFile);
    const exists = await this.fileExists(placeholderPath);
    
    if (!exists) {
      const svg = this.generateSVGPlaceholder(mediaFile.subCategory || 'image');
      await fs.writeFile(placeholderPath, svg, 'utf-8');
      this.report.generatedPlaceholders++;
      console.log(`🎨 Generated placeholder for failed download: ${path.basename(placeholderPath)}`);
    }
  }

  /**
   * Get placeholder path for media file
   */
  private getPlaceholderPath(mediaFile: MediaFile): string {
    const baseDir = path.join(this.config.mediaOutputPath, mediaFile.category, 'placeholders');
    const filename = path.basename(mediaFile.localPath, path.extname(mediaFile.localPath)) + '-placeholder.svg';
    return path.join(baseDir, filename);
  }

  /**
   * Generate category-specific placeholders
   */
  private async generateCategoryPlaceholders(): Promise<void> {
    const categoryPlaceholders = [
      { category: 'partners', subdir: 'placeholders', name: 'partner-logo-placeholder.svg', type: 'logo' },
      { category: 'partners', subdir: 'placeholders', name: 'partner-image-placeholder.svg', type: 'image' },
      { category: 'products', subdir: 'placeholders', name: 'product-image-placeholder.svg', type: 'product' },
      { category: 'blog', subdir: 'placeholders', name: 'blog-post-placeholder.svg', type: 'blog' },
      { category: 'team', subdir: 'placeholders', name: 'team-member-placeholder.svg', type: 'avatar' },
      { category: 'categories', subdir: 'placeholders', name: 'category-icon-placeholder.svg', type: 'icon' }
    ];

    for (const placeholder of categoryPlaceholders) {
      const fullPath = path.join(this.config.mediaOutputPath, placeholder.category, placeholder.subdir, placeholder.name);
      const exists = await this.fileExists(fullPath);
      
      if (!exists) {
        const svg = this.generateSVGPlaceholder(placeholder.type);
        await fs.writeFile(fullPath, svg, 'utf-8');
        this.report.generatedPlaceholders++;
      }
    }
  }

  /**
   * Generate SVG placeholder
   */
  private generateSVGPlaceholder(type: string): string {
    const colors = {
      image: { bg: '#f3f4f6', icon: '#9ca3af', text: '#6b7280' },
      logo: { bg: '#e5e7eb', icon: '#4b5563', text: '#374151' },
      avatar: { bg: '#ddd6fe', icon: '#8b5cf6', text: '#7c3aed' },
      product: { bg: '#fef3c7', icon: '#f59e0b', text: '#d97706' },
      blog: { bg: '#dcfce7', icon: '#22c55e', text: '#16a34a' },
      icon: { bg: '#e0e7ff', icon: '#6366f1', text: '#4f46e5' }
    };

    const color = colors[type] || colors.image;
    const icons = {
      image: '🖼️',
      logo: '🏢',
      avatar: '👤',
      product: '📦',
      blog: '📝',
      icon: '🔧'
    };
    const icon = icons[type] || icons.image;

    return `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="${color.bg}" stroke="${color.icon}" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="200" y="130" text-anchor="middle" fill="${color.text}" font-family="Arial, sans-serif" font-size="48">${icon}</text>
  <text x="200" y="180" text-anchor="middle" fill="${color.text}" font-family="Arial, sans-serif" font-size="16" opacity="0.7">${type.toUpperCase()} PLACEHOLDER</text>
  <text x="200" y="200" text-anchor="middle" fill="${color.text}" font-family="Arial, sans-serif" font-size="12" opacity="0.5">400 × 300</text>
</svg>`;
  }

  /**
   * Increment category counter
   */
  private incrementCategoryCount(category: string): void {
    this.report.filesByCategory[category] = (this.report.filesByCategory[category] || 0) + 1;
  }

  /**
   * Generate media file list from URLs
   */
  static generateMediaFileList(urls: string[], baseOutputPath: string): MediaFile[] {
    return urls.map((url, index) => {
      const parsedUrl = new URL(url);
      const filename = path.basename(parsedUrl.pathname) || `file-${index + 1}.jpg`;
      
      // Categorize based on URL patterns
      let category: MediaFile['category'] = 'system';
      let subCategory: MediaFile['subCategory'] = 'image';
      let localPath = '';

      if (url.includes('/partners/') || url.includes('partner')) {
        category = 'partner';
        if (url.includes('logo')) {
          subCategory = 'logo';
          localPath = path.join(baseOutputPath, 'partners', 'logos', filename);
        } else {
          subCategory = 'image';
          localPath = path.join(baseOutputPath, 'partners', 'images', filename);
        }
      } else if (url.includes('/products/') || url.includes('product')) {
        category = 'product';
        subCategory = 'image';
        localPath = path.join(baseOutputPath, 'products', 'images', filename);
      } else if (url.includes('/blog/') || url.includes('blog')) {
        category = 'blog';
        subCategory = 'post';
        localPath = path.join(baseOutputPath, 'blog', 'posts', filename);
      } else if (url.includes('/team/') || url.includes('team')) {
        category = 'team';
        subCategory = 'headshot';
        localPath = path.join(baseOutputPath, 'team', 'headshots', filename);
      } else if (url.includes('/company/') || url.includes('company')) {
        category = 'company';
        subCategory = url.includes('logo') ? 'logo' : 'image';
        const subdir = subCategory === 'logo' ? 'logos' : 'brand';
        localPath = path.join(baseOutputPath, 'company', subdir, filename);
      } else {
        localPath = path.join(baseOutputPath, 'system', 'optimized', filename);
      }

      return {
        id: crypto.createHash('md5').update(url).digest('hex'),
        originalUrl: url,
        localPath,
        type: 'image',
        category,
        subCategory
      };
    });
  }
}

export { MediaMigrator, MediaFile, MediaMigrationConfig, MediaMigrationReport };
/**
 * UI Component Mocks
 *
 * Mock implementations of UI components for testing purposes.
 * These mocks provide simplified versions of complex components
 * to make testing easier and faster.
 */

import React from 'react';

// ============================================================================
// Rich Text Editor Mock
// ============================================================================

/**
 * Mock rich text editor (Lexical)
 * Simplified to a textarea for testing
 */
export const MockRichTextEditor = ({
  onChange,
  initialValue = '',
  placeholder = '',
  maxLength,
  disabled = false,
}: {
  onChange: (value: string) => void;
  initialValue?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}) => (
  <textarea
    data-testid="rich-text-editor"
    defaultValue={initialValue}
    placeholder={placeholder}
    maxLength={maxLength}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    aria-label="Rich text editor"
  />
);

// ============================================================================
// Media Uploader Mock
// ============================================================================

/**
 * Mock media uploader component
 * Simulates file upload with preview
 */
export const MockMediaUploader = ({
  onUpload,
  value,
  accept = 'image/*',
  maxSize = 5000000, // 5MB
  label = 'Upload Image',
}: {
  onUpload: (file: { url: string; name: string; size: number }) => void;
  value?: string;
  accept?: string;
  maxSize?: number;
  label?: string;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      onUpload({
        url: `https://example.com/uploads/${file.name}`,
        name: file.name,
        size: file.size,
      });
    }
  };

  return (
    <div data-testid="media-uploader">
      <label htmlFor="file-upload">{label}</label>
      <input
        id="file-upload"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        data-max-size={maxSize}
      />
      {value && (
        <div data-testid="upload-preview">
          <img src={value} alt="Preview" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Toast Notification Mocks
// ============================================================================

/**
 * Mock toast notification functions
 */
export const mockToast = {
  success: jest.fn((message: string) => {
    console.log('[Toast Success]', message);
  }),
  error: jest.fn((message: string) => {
    console.log('[Toast Error]', message);
  }),
  info: jest.fn((message: string) => {
    console.log('[Toast Info]', message);
  }),
  warning: jest.fn((message: string) => {
    console.log('[Toast Warning]', message);
  }),
  dismiss: jest.fn(),
};

/**
 * Mock toast provider for testing
 */
export const MockToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="toast-provider">{children}</div>;
};

// ============================================================================
// Dialog/Modal Mock
// ============================================================================

/**
 * Mock dialog component
 */
export const MockDialog = ({
  open,
  onOpenChange,
  children,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      data-testid="mock-dialog"
    >
      {title && <h2 id="dialog-title">{title}</h2>}
      <button onClick={() => onOpenChange(false)} aria-label="Close">
        Close
      </button>
      {children}
    </div>
  );
};

// ============================================================================
// Loading Skeleton Mock
// ============================================================================

/**
 * Mock skeleton loader
 */
export const MockSkeleton = ({
  width = '100%',
  height = '20px',
  variant = 'rectangular',
}: {
  width?: string;
  height?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}) => (
  <div
    data-testid="skeleton-loader"
    data-variant={variant}
    style={{ width, height }}
    aria-busy="true"
    aria-label="Loading..."
  />
);

// ============================================================================
// Badge Mock
// ============================================================================

/**
 * Mock badge component
 */
export const MockBadge = ({
  children,
  variant = 'default',
  size = 'md',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}) => (
  <span
    data-testid="badge"
    data-variant={variant}
    data-size={size}
    role="status"
  >
    {children}
  </span>
);

// ============================================================================
// Card Mock
// ============================================================================

/**
 * Mock card component
 */
export const MockCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div data-testid="card" className={className}>
    {children}
  </div>
);

// ============================================================================
// Tabs Mock
// ============================================================================

/**
 * Mock tabs component
 */
export const MockTabs = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => (
  <div data-testid="tabs" data-value={value}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          activeTab: value,
          onTabChange: onValueChange,
        });
      }
      return child;
    })}
  </div>
);

export const MockTabsList = ({ children, activeTab, onTabChange }: any) => (
  <div role="tablist" data-testid="tabs-list">
    {React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          active: child.props.value === activeTab,
          onClick: () => onTabChange(child.props.value),
        });
      }
      return child;
    })}
  </div>
);

export const MockTabsTrigger = ({ value, children, active, onClick }: any) => (
  <button
    role="tab"
    aria-selected={active}
    data-testid={`tab-${value}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export const MockTabsContent = ({ value, children, activeTab }: any) => {
  if (value !== activeTab) return null;
  return (
    <div role="tabpanel" data-testid={`tabpanel-${value}`}>
      {children}
    </div>
  );
};

// ============================================================================
// Form Field Mocks
// ============================================================================

/**
 * Mock form field wrapper
 */
export const MockFormField = ({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div data-testid={`form-field-${name}`}>
    <label htmlFor={name}>{label}</label>
    {children}
    {error && (
      <span role="alert" data-testid={`error-${name}`}>
        {error}
      </span>
    )}
  </div>
);

// ============================================================================
// Map Component Mock
// ============================================================================

/**
 * Mock map component (Leaflet)
 */
export const MockMap = ({
  center,
  zoom = 10,
  markers = [],
}: {
  center: [number, number];
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
}) => (
  <div
    data-testid="map-component"
    data-center={JSON.stringify(center)}
    data-zoom={zoom}
  >
    <div data-testid="map-markers">
      {markers.map((marker, index) => (
        <div
          key={index}
          data-testid={`map-marker-${index}`}
          data-lat={marker.lat}
          data-lng={marker.lng}
        >
          {marker.label}
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// Avatar Mock
// ============================================================================

/**
 * Mock avatar component
 */
export const MockAvatar = ({
  src,
  alt,
  fallback,
  size = 'md',
}: {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}) => (
  <div data-testid="avatar" data-size={size}>
    {src ? (
      <img src={src} alt={alt} />
    ) : (
      <span data-testid="avatar-fallback">{fallback || alt.charAt(0)}</span>
    )}
  </div>
);

// ============================================================================
// Select Mock
// ============================================================================

/**
 * Mock select component
 */
export const MockSelect = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    data-testid="select"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// ============================================================================
// Alert Mock
// ============================================================================

/**
 * Mock alert component
 */
export const MockAlert = ({
  children,
  variant = 'default',
  title,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  title?: string;
}) => (
  <div role="alert" data-testid="alert" data-variant={variant}>
    {title && <div data-testid="alert-title">{title}</div>}
    <div data-testid="alert-description">{children}</div>
  </div>
);

// ============================================================================
// Scroll Area Mock
// ============================================================================

/**
 * Mock scroll area component
 */
export const MockScrollArea = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div data-testid="scroll-area" className={className} style={{ overflow: 'auto' }}>
    {children}
  </div>
);

// ============================================================================
// Separator Mock
// ============================================================================

/**
 * Mock separator component
 */
export const MockSeparator = ({
  orientation = 'horizontal',
}: {
  orientation?: 'horizontal' | 'vertical';
}) => (
  <hr
    data-testid="separator"
    data-orientation={orientation}
    role="separator"
    aria-orientation={orientation}
  />
);

// ============================================================================
// Checkbox Mock
// ============================================================================

/**
 * Mock checkbox component
 */
export const MockCheckbox = ({
  checked,
  onCheckedChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) => (
  <label data-testid="checkbox-label">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      data-testid="checkbox"
    />
    {label && <span>{label}</span>}
  </label>
);

// ============================================================================
// Progress Bar Mock
// ============================================================================

/**
 * Mock progress bar component
 */
export const MockProgress = ({
  value,
  max = 100,
  label,
}: {
  value: number;
  max?: number;
  label?: string;
}) => (
  <div data-testid="progress" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
    <div data-testid="progress-bar" style={{ width: `${(value / max) * 100}%` }} />
    {label && <span data-testid="progress-label">{label}</span>}
  </div>
);

// ============================================================================
// Breadcrumbs Mock
// ============================================================================

/**
 * Mock breadcrumbs component
 */
export const MockBreadcrumbs = ({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) => (
  <nav aria-label="Breadcrumb" data-testid="breadcrumbs">
    <ol>
      {items.map((item, index) => (
        <li key={index}>
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span>{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

// ============================================================================
// Geocoding Button Mock (from existing component)
// ============================================================================

/**
 * Mock geocoding button for location tests
 */
export const MockGeocodingButton = ({
  onSuccess,
  address,
}: {
  onSuccess: (lat: number, lng: number) => void;
  address?: string;
}) => (
  <button
    data-testid="geocoding-button"
    onClick={() => {
      // Simulate successful geocoding
      onSuccess(43.7384, 7.4246); // Monaco coordinates
    }}
    aria-label="Get coordinates"
  >
    Get Coordinates
  </button>
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create mock file for file upload testing
 */
export function createMockFile(
  name: string = 'test-image.jpg',
  size: number = 1024,
  type: string = 'image/jpeg'
): File {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/**
 * Mock image load event
 */
export function mockImageLoad(element: HTMLImageElement) {
  const event = new Event('load');
  element.dispatchEvent(event);
}

/**
 * Mock network delay for async operations
 */
export function mockNetworkDelay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock successful API response
 */
export function mockApiSuccess<T>(data: T, delay: number = 100): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

/**
 * Mock failed API response
 */
export function mockApiError(
  message: string = 'API Error',
  delay: number = 100
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}

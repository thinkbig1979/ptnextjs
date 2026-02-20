import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Available visual variants for the PixelGridBackground component.
 *
 * - `subtle`: Uses `.pixel-grid-bg` class - a minimal grid pattern
 * - `prominent`: Uses `.pixel-field` class - grid with light field overlay for hero sections
 * - `prominent-dark`: Uses `.pixel-field-dark` class - optimized for dark mode hero sections
 */
type PixelGridVariant = "subtle" | "prominent" | "prominent-dark";

/**
 * Props for the PixelGridBackground component.
 */
interface PixelGridBackgroundProps {
  /**
   * The visual intensity variant of the pixel grid.
   * @default "subtle"
   */
  variant?: PixelGridVariant;

  /**
   * Content to overlay on top of the pixel grid background.
   * Positioned with relative z-index to appear above the background.
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes to apply to the container.
   */
  className?: string;

  /**
   * HTML tag to use for the container element.
   * @default "div"
   */
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "main";

  /**
   * Accessible label for screen readers when using semantic elements.
   */
  "aria-label"?: string;
}

/**
 * Maps variant names to their corresponding CSS classes defined in globals.css.
 */
const variantClasses: Record<PixelGridVariant, string> = {
  subtle: "pixel-grid-bg",
  prominent: "pixel-field",
  "prominent-dark": "pixel-field-dark",
};

/**
 * PixelGridBackground - A reusable component that renders an abstract pixel grid background.
 *
 * This component wraps the pixel grid CSS utility classes defined in globals.css,
 * providing a consistent API for creating backgrounds with LED pixel-inspired patterns.
 *
 * The component supports three visual variants:
 * - **subtle**: A minimal grid pattern suitable for sections needing subtle texture
 * - **prominent**: Grid with a light field overlay, ideal for hero sections
 * - **prominent-dark**: Optimized version of prominent for dark mode hero sections
 *
 * All variants automatically adapt to the current theme (light/dark mode) via CSS.
 *
 * @example
 * // Basic usage with default subtle variant
 * <PixelGridBackground>
 *   <h1>Welcome</h1>
 * </PixelGridBackground>
 *
 * @example
 * // Hero section with prominent variant
 * <PixelGridBackground
 *   variant="prominent"
 *   as="section"
 *   aria-label="Hero section"
 *   className="min-h-screen"
 * >
 *   <div className="container">
 *     <h1>Hero Content</h1>
 *   </div>
 * </PixelGridBackground>
 *
 * @example
 * // Dark mode optimized section
 * <PixelGridBackground variant="prominent-dark" className="py-20">
 *   <FeatureGrid />
 * </PixelGridBackground>
 */
export function PixelGridBackground({
  variant = "subtle",
  children,
  className,
  as: Component = "div",
  "aria-label": ariaLabel,
}: PixelGridBackgroundProps): React.JSX.Element {
  return (
    <Component
      className={cn(
        "relative",
        variantClasses[variant],
        className
      )}
      aria-label={ariaLabel}
    >
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </Component>
  );
}

/**
 * Default export for convenient importing.
 */

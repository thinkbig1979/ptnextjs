import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Position options for the light field gradient.
 * - `left`: Gradient positioned at 30% from left (uses .light-field)
 * - `center`: Gradient centered at 50% (uses .light-field-center)
 * - `right`: Gradient positioned at 70% from left (uses .light-field-right)
 */
export type LightFieldPosition = "left" | "center" | "right";

/**
 * Intensity levels for the gradient opacity.
 * - `subtle`: 50% opacity - barely visible, good for backgrounds
 * - `soft`: 70% opacity - gentle glow effect
 * - `normal`: 100% opacity - default CSS values
 * - `strong`: 120% opacity via brightness filter - more prominent
 * - `intense`: 150% opacity via brightness filter - maximum visibility
 */
export type LightFieldIntensity = "subtle" | "soft" | "normal" | "strong" | "intense";

/**
 * Props for the LightFieldGradient component.
 */
export interface LightFieldGradientProps {
  /**
   * Position of the radial gradient center.
   * @default "left"
   */
  position?: LightFieldPosition;

  /**
   * Intensity/opacity level of the gradient.
   * @default "normal"
   */
  intensity?: LightFieldIntensity;

  /**
   * Optional overlay content to render on top of the gradient.
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes to apply to the container.
   */
  className?: string;

  /**
   * Whether to include the glow-accent effect for text elements within.
   * @default false
   */
  withGlow?: boolean;

  /**
   * HTML element to render as the container.
   * @default "div"
   */
  as?: React.ElementType;
}

/**
 * Maps position prop to the corresponding CSS class from globals.css.
 */
const positionClassMap: Record<LightFieldPosition, string> = {
  left: "light-field",
  center: "light-field-center",
  right: "light-field-right",
};

/**
 * Maps intensity prop to opacity/filter classes.
 */
const intensityClassMap: Record<LightFieldIntensity, string> = {
  subtle: "opacity-50",
  soft: "opacity-70",
  normal: "", // Uses default CSS values
  strong: "brightness-[1.2]",
  intense: "brightness-[1.5]",
};

/**
 * LightFieldGradient - A reusable component that renders abstract light field gradients.
 *
 * Used to suggest light behavior without actual imagery, creating ambient visual effects
 * that enhance the Paul Thames brand aesthetic. The component leverages CSS classes
 * defined in globals.css and supports both dark and light modes automatically.
 *
 * @example
 * ```tsx
 * // Basic usage with default left position
 * <LightFieldGradient>
 *   <h1>Welcome</h1>
 * </LightFieldGradient>
 *
 * // Centered gradient with soft intensity
 * <LightFieldGradient position="center" intensity="soft">
 *   <p>Content with subtle glow background</p>
 * </LightFieldGradient>
 *
 * // Right-positioned intense gradient with glow effect
 * <LightFieldGradient position="right" intensity="intense" withGlow>
 *   <span className="glow-accent">Highlighted Text</span>
 * </LightFieldGradient>
 *
 * // As a section element with custom classes
 * <LightFieldGradient as="section" className="min-h-screen" position="center">
 *   <div>Hero content</div>
 * </LightFieldGradient>
 * ```
 */
export function LightFieldGradient({
  position = "left",
  intensity = "normal",
  children,
  className,
  withGlow = false,
  as: Component = "div",
}: LightFieldGradientProps): React.JSX.Element {
  const positionClass = positionClassMap[position];
  const intensityClass = intensityClassMap[intensity];

  return (
    <Component
      className={cn(
        "relative",
        positionClass,
        intensityClass,
        className
      )}
    >
      {withGlow && children ? (
        <div className="glow-accent">{children}</div>
      ) : (
        children
      )}
    </Component>
  );
}

export default LightFieldGradient;

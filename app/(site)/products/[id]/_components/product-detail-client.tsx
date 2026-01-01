
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { 
  Phone,
  Mail,
  Download,
  Play,
  ExternalLink
} from "lucide-react";
import type { Product, Partner } from "@/lib/types";

interface ProductDetailClientProps {
  product: Product;
  partner: Partner | undefined;
}

export default function ProductDetailClient({ product, partner: _partner }: ProductDetailClientProps) {

  // Enhanced handler functions with proper functionality
  const handleAction = (action: string, actionData?: string, _label?: string) => {
    switch (action) {
      case 'contact':
        // Redirect to contact form with product context
        const contactUrl = `/contact?product=${encodeURIComponent(product.name)}&type=contact`;
        window.location.href = contactUrl;
        break;
        
      case 'quote':
        // Redirect to quote request form
        const quoteUrl = `/contact?product=${encodeURIComponent(product.name)}&type=quote`;
        window.location.href = quoteUrl;
        break;
        
      case 'download':
        // Handle file download
        if (actionData) {
          // Open download link in new tab
          window.open(actionData, '_blank');
        } else {
          // Fallback behavior
          alert(`Download for "${product?.name}" will be available soon. Please contact our sales team for more information.`);
        }
        break;
        
      case 'external_link':
        // Open external link
        if (actionData) {
          window.open(actionData, '_blank', 'noopener,noreferrer');
        }
        break;
        
      case 'video':
        // Open video player or external video link
        if (actionData) {
          window.open(actionData, '_blank');
        } else {
          // Fallback behavior
          alert(`Demo video for "${product?.name}" will be available soon.`);
        }
        break;
        
      default:
        console.warn(`Unknown action type: ${action}`);
        break;
    }
  };

  // Get icon component based on icon name
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Phone':
        return <Phone className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'Mail':
        return <Mail className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'Download':
        return <Download className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'Play':
        return <Play className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'ExternalLink':
        return <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />;
      default:
        return null;
    }
  };

  // Use CMS action buttons if available, otherwise fallback to defaults
  const actionButtons = Array.isArray(product.action_buttons) && product.action_buttons.length > 0 
    ? product.action_buttons.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
        { label: "Request Quote", type: "primary" as const, action: "quote" as const, icon: "Phone", order: 1 },
        { label: "Contact Sales", type: "outline" as const, action: "contact" as const, icon: "Mail", order: 2 },
        { label: "Download Brochure", type: "outline" as const, action: "download" as const, icon: "Download", order: 3 },
        { label: "Demo Video", type: "secondary" as const, action: "video" as const, icon: "Play", order: 4 }
      ];

  return (
    <div className="space-y-3">
      {actionButtons.map((button) => (
        <Button
          key={`action-${button.action}-${button.label}`}
          variant={button.type === 'primary' ? 'default' : button.type}
          className={`w-full h-auto py-3 ${button.type === 'primary' ? 'bg-accent hover:bg-accent/90' : ''}`}
          onClick={() => handleAction(button.action, button.action_data, button.label)}
        >
          {getIcon(button.icon)}
          <span className="break-words">{button.label}</span>
        </Button>
      ))}
    </div>
  );
}

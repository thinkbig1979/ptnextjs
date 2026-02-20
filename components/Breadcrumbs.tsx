import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo-config';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <JsonLd data={getBreadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${index}-${item.href}`} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden="true" className="text-muted-foreground/50">/</span>
                )}
                {isLast ? (
                  <span aria-current="page" className="text-foreground font-medium">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

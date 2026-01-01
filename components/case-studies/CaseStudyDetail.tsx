"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VendorCaseStudy } from "@/lib/types";

interface CaseStudyDetailProps {
  caseStudy: VendorCaseStudy;
  vendor: {
    name: string;
    slug: string;
  };
  className?: string;
}

export function CaseStudyDetail({
  caseStudy,
  vendor,
  className
}: CaseStudyDetailProps) {
  const [shareOpen, setShareOpen] = React.useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: caseStudy.title,
        text: caseStudy.challenge,
        url: window.location.href,
      });
    } else {
      setShareOpen(!shareOpen);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareOpen(false);
  };

  return (
    <div
      className={cn("container max-w-4xl mx-auto px-4 py-8", className)}
      data-testid="case-study-detail"
    >
      {/* Breadcrumb Navigation */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link
              href={`/vendors/${vendor.slug}`}
              className="hover:text-accent transition-colors"
            >
              {vendor.name}
            </Link>
          </li>
          <li>/</li>
          <li>Case Studies</li>
          <li>/</li>
          <li className="text-foreground">{caseStudy.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="font-cormorant text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {caseStudy.title}
            </h1>

            {caseStudy.client && (
              <p className="text-xl text-muted-foreground font-poppins-medium">
                Client: {caseStudy.client}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="ml-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share case study
          </Button>
        </div>

        {/* Technologies */}
        {caseStudy.technologies && caseStudy.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2" data-testid="technology-tags">
            {caseStudy.technologies.map((tech) => (
              <Badge key={`tech-${tech}`} variant="secondary" className="px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Image Gallery */}
      {caseStudy.images && caseStudy.images.length > 0 && (
        <section className="mb-12">
          <div className="grid gap-4">
            {caseStudy.images.length === 1 ? (
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={caseStudy.images[0]}
                  alt={`${caseStudy.title} main image`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 896px"
                  priority
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {caseStudy.images.map((image) => (
                  <div
                    key={image}
                    className="aspect-video relative rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <Image
                      src={image}
                      alt={`${caseStudy.title} gallery image`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="grid gap-12 lg:gap-16">
        {/* Challenge */}
        <section>
          <h2 className="font-cormorant text-3xl font-bold mb-6 text-accent">
            Challenge
          </h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {caseStudy.challenge}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Solution */}
        <section>
          <h2 className="font-cormorant text-3xl font-bold mb-6 text-accent">
            Solution
          </h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {caseStudy.solution}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Results */}
        {caseStudy.results && (
          <section>
            <h2 className="font-cormorant text-3xl font-bold mb-6 text-accent">
              Results
            </h2>
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {caseStudy.results}
                </p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* Bottom Navigation */}
      <footer className="mt-16 pt-8 border-t">
        <div className="flex items-center justify-between">
          <Link
            href={`/vendors/${vendor.slug}`}
            className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {vendor.name}
          </Link>

          {shareOpen && (
            <div className="relative">
              <Card className="absolute bottom-full right-0 mb-2 p-4 min-w-48">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="w-full justify-start"
                  >
                    Copy link
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
import * as React from "react";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { BlogClient } from "./_components/blog-client";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_CONFIG } from '@/lib/seo-config';
import type { Metadata } from 'next';

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Blog | Superyacht Technology Insights from Paul Thames',
  description: 'Expert insights on superyacht AV/IT systems, security, and custom lighting from industry veterans Edwin Edelenbos and Roel van der Zwet.',
  openGraph: {
    title: 'Blog | Superyacht Technology Insights from Paul Thames',
    description: 'Expert insights on superyacht AV/IT systems, security, and custom lighting from industry veterans Edwin Edelenbos and Roel van der Zwet.',
    url: 'https://paulthames.com/blog',
  },
  twitter: {
    title: 'Blog | Superyacht Technology Insights from Paul Thames',
    description: 'Expert insights on superyacht AV/IT systems, security, and custom lighting from industry veterans Edwin Edelenbos and Roel van der Zwet.',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  // Fetch data in parallel to eliminate waterfall
  const [blogPosts, categories] = await Promise.all([
    payloadCMSDataService.getAllBlogPosts(),
    payloadCMSDataService.getBlogCategories(),
  ]);
  const blogCategories = categories.map(cat => cat.name);
  
  const featuredPost = blogPosts.find(post => post?.featured);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog | Superyacht Technology Insights from Paul Thames',
    description: 'Expert insights on superyacht AV/IT systems, security, and custom lighting from industry veterans Edwin Edelenbos and Roel van der Zwet.',
    url: `${SITE_CONFIG.url}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: blogPosts.length,
      itemListElement: blogPosts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: `${SITE_CONFIG.url}/blog/${post.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen py-12">
      <JsonLd data={blogSchema} />
      <div className="container max-w-screen-xl">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Industry Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Practical insights on superyacht AV/IT, lighting, security, and control systems from
            the Paul Thames team. Written from project experience, not press releases. Feel free
            to contact us if you would like to discuss any of the topics we touch on.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <Card className="hover-lift cursor-pointer group overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-accent/10 to-primary/10">
                  <div className="h-64 md:h-full flex items-center justify-center">
                    <div className="text-center space-y-2 p-6">
                      <Badge variant="default" className="bg-accent">Featured Article</Badge>
                      <div className="text-accent text-4xl font-cormorant font-bold">Featured</div>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-3">
                      <Badge variant="secondary">{featuredPost.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(featuredPost.publishedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl group-hover:text-accent transition-colors">
                      {featuredPost.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {featuredPost.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="accent" className="group">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        Read Full Article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Client-side Interactive Blog Content */}
        <Suspense fallback={<div className="space-y-8 animate-pulse">
          <div className="h-6 bg-muted/20 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={`blog-skeleton-${i}`} className="h-96 bg-muted/20 rounded-lg" />
            ))}
          </div>
        </div>}>
          <BlogClient
            blogPosts={blogPosts}
            categories={blogCategories}
          />
        </Suspense>
      </div>
    </div>
  );
}

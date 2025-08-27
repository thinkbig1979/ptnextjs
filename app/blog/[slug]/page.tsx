
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import BlogPostClient from "./_components/blog-post-client";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";
import { OptimizedImage } from "@/components/ui/optimized-image";

// Force static generation for optimal SEO and performance
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    console.log('🏗️  Generating static params for blog post pages...');
    const blogPostSlugs = await tinaCMSDataService.getBlogPostSlugs();
    console.log(`📋 Found ${blogPostSlugs.length} blog posts for static generation`);
    
    const params = blogPostSlugs.map((slug) => ({ slug }));
    console.log(`✅ Generated ${params.length} static blog post params`);
    return params;
  } catch (error) {
    console.error('❌ Failed to generate static params for blog posts:', error);
    throw error; // Fail the build if we can't generate static params
  }
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Await the params in server component
  const { slug } = await params;

  // Find the blog post by slug using static data service
  const post = await tinaCMSDataService.getBlogPostBySlug(slug);
  
  if (!post) {
    console.warn(`⚠️  Blog post not found for slug: ${slug}`);
    notFound();
  }

  console.log(`✅ Loading blog post: ${post.title}`);

  // Get related posts (simplified version for static generation)
  const allBlogPosts = await tinaCMSDataService.getAllBlogPosts();
  const relatedPosts = allBlogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="group">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <div className="flex items-center text-sm text-muted-foreground space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-cormorant font-bold mb-6">
            {post.title}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 font-poppins-light leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between border-t border-b py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="font-medium">{post.author}</div>
                <div className="text-sm text-muted-foreground">Technology Analyst</div>
              </div>
            </div>
            
            <BlogPostClient post={post} />
          </div>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-12">
            <div className="rounded-lg border overflow-hidden">
              <OptimizedImage
                src={post.image}
                alt={post.title}
                fallbackType="generic"
                aspectRatio="video"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-foreground leading-relaxed font-poppins-light"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-medium mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t pt-12">
            <h3 className="text-2xl font-cormorant font-bold mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="hover-lift cursor-pointer group">
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {relatedPost.category}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {relatedPost.readTime}
                        </div>
                      </div>
                      <h4 className="font-medium group-hover:text-accent transition-colors line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-3 pt-3 border-t">
                        <User className="w-3 h-3 mr-1" />
                        {relatedPost.author}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

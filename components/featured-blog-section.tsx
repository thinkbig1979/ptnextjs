

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface FeaturedBlogSectionProps {
  featuredPosts: any[];
}

export function FeaturedBlogSection({ featuredPosts }: FeaturedBlogSectionProps) {

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container max-w-screen-xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-cormorant font-bold mb-4">
            Industry Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Stay updated with the latest trends and innovations in superyacht technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post, _index) => (
            <div key={post?.id}>
              <Card className="h-full hover-lift cursor-pointer group">
                <Link href={`/blog/${post?.slug}`} className="block h-full">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="secondary">{post?.category}</Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {post?.readTime}
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-accent transition-colors line-clamp-2">
                    {post?.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post?.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{post?.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post?.publishedAt || '')}</span>
                    </div>
                  </div>
                </CardContent>
                </Link>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="accent" className="group">
            <Link href="/blog">
              Read All Articles
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

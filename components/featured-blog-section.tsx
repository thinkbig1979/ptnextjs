
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";
import { blogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function FeaturedBlogSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const featuredPosts = blogPosts.filter(post => post?.featured).slice(0, 3);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container max-w-screen-xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-cormorant font-bold mb-4">
            Industry Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Stay updated with the latest trends and innovations in superyacht technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post, index) => (
            <motion.div
              key={post?.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
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
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" variant="accent" className="group">
            <Link href="/blog">
              Read All Articles
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

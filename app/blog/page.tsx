
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/search-filter";
import { Pagination } from "@/components/pagination";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { blogPosts, searchBlogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const ITEMS_PER_PAGE = 9;
const blogCategories = ["Technology Trends", "Industry News", "Innovation", "Product Updates"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Filter blog posts based on search and category
  const filteredPosts = React.useMemo(() => {
    let filtered = blogPosts;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchBlogPosts(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post?.category === selectedCategory);
    }

    return filtered.sort((a, b) => new Date(b?.publishedAt || '').getTime() - new Date(a?.publishedAt || '').getTime());
  }, [searchQuery, selectedCategory]);

  // Paginate results
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const featuredPost = blogPosts.find(post => post?.featured);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Industry Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Insights, trends, and innovations in superyacht technology from industry experts
          </p>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
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
          </motion.div>
        )}

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={blogCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            placeholder="Search articles by title, content, or tags..."
          />
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-muted-foreground font-poppins-light">
            Showing {paginatedPosts.length} of {filteredPosts.length} articles
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {paginatedPosts.map((post, index) => (
            <motion.div
              key={post?.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full hover-lift cursor-pointer group">
                <Link href={`/blog/${post?.slug}`} className="block h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
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
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {post?.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{post?.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post?.publishedAt || '')}</span>
                      </div>
                    </div>

                  </div>
                </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground font-poppins-light text-lg">
              No articles found matching your criteria. Try adjusting your search or filters.
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

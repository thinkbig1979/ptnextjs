
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Ship, Zap } from "lucide-react";
import Link from "next/link";
import { companyInfo } from "@/lib/data";

const stats = [
  { icon: Users, label: "Partner Companies", value: 50, suffix: "+" },
  { icon: Ship, label: "Yachts Equipped", value: 200, suffix: "+" },
  { icon: Zap, label: "Technology Solutions", value: 500, suffix: "+" },
];

function HeroLogo() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative w-64 md:w-96 h-20 md:h-32 bg-muted animate-pulse rounded" />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' 
    ? '/images/Paul-Thames-logo-PNG-white.png'
    : '/images/Paul-Thames-logo-PNG-black.png';

  return (
    <div className="relative w-64 md:w-96 h-20 md:h-32">
      <Image
        src={logoSrc}
        alt="Paul Thames"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 256px, 384px"
      />
    </div>
  );
}

export function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary blur-3xl"></div>
      </div>

      <div className="container max-w-screen-xl px-4 py-20 relative z-10">
        <div className="text-center space-y-8">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <HeroLogo />
              </motion.div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-cormorant font-bold tracking-tight">
              Superyacht Technology
              <span className="block text-accent">Excellence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
              {companyInfo.description}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" variant="accent" className="group">
              <Link href="/partners">
                Explore Partners
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Learn Our Story</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-20 border-t border-border/50"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-cormorant font-bold">
                  <CountUp end={stat.value} inView={inView} />
                  {stat.suffix}
                </div>
                <p className="text-muted-foreground font-poppins-light">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Count up animation component
function CountUp({ end, inView }: { end: number; inView: boolean }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = end / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end, inView]);

  return <span>{count}</span>;
}

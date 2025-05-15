import Image from "next/image";
import React from "react";

interface FeatureCardProps {
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: React.ReactNode; // Allows passing JSX with links
}

export function FeatureCard({ iconSrc, iconAlt, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-lg bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60 hover:-translate-y-1 flex flex-row items-start gap-4 text-left h-full">
      {/* Icon Container - No longer mx-auto, aligned to the start of the flex row */}
      <div className="flex-shrink-0 mt-1 w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center">
        <Image 
          src={iconSrc} 
          alt={iconAlt} 
          width={24} // Standardize icon display size
          height={24}
          className="text-primary" // Removed transition-colors, not typical for static icon
        />
      </div>
      {/* Text Content Container */}
      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-1 text-foreground"> {/* Reduced mb slightly */}
          {title}
        </h2>
        <p className="text-muted-foreground text-sm"> {/* Standardized text size */}
          {description}
        </p>
      </div>
    </div>
  );
} 

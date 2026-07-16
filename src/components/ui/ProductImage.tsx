"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImageProps = Omit<ImageProps, "onError" | "onLoad"> & {
  containerClassName?: string;
};

export function ProductImage({ containerClassName, className, alt, ...props }: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={cn("flex items-center justify-center bg-mist", containerClassName)}>
        <ImageOff size={20} className="text-ink-400" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-mist", containerClassName)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-line/60" aria-hidden />}
      <Image
        {...props}
        alt={alt}
        loading={props.priority ? undefined : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(className, "transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}

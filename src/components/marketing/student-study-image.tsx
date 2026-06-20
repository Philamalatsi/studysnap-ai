import Image from "next/image";
import { cn } from "@/lib/utils";

const CAROUSEL_WIDTH = 800;
const CAROUSEL_HEIGHT = 600;

export function StudentStudyImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={CAROUSEL_WIDTH}
      height={CAROUSEL_HEIGHT}
      priority={priority}
      unoptimized
      className={cn(
        "h-full w-full object-cover object-center",
        className,
      )}
    />
  );
}

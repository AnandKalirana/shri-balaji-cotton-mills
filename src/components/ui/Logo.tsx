import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Company logo. "dark" is the green logo for light backgrounds,
 * "light" is the cream version for dark backgrounds (footer, admin sidebar).
 */
export function Logo({
  tone = "dark",
  className,
  alt = "Shri Balaji Cotton Mills",
  priority = false,
}: {
  tone?: "dark" | "light";
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={tone === "light" ? "/brand/logo-light.png" : "/brand/logo.png"}
      alt={alt}
      width={1400}
      height={256}
      priority={priority}
      className={cn("h-8 w-auto", className)}
    />
  );
}

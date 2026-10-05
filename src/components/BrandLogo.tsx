import Image from "next/image";
import { BRANDS, type Employer } from "@/lib/brands";

export function BrandLogo({ employer, size = "md" }: { employer: Employer; size?: "sm" | "md" | "lg" }) {
  const b = BRANDS[employer];
  const dims = size === "sm" ? "h-9 w-9 text-base" : size === "lg" ? "h-16 w-16 text-2xl" : "h-12 w-12 text-xl";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  const imageBox = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${imageBox} relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-border`}
        style={{
          boxShadow: `0 10px 30px -10px ${b.primary}66`,
        }}
      >
        <Image
          src={b.logoImage}
          alt={`${b.logoText} logo`}
          fill
          sizes={size === "lg" ? "64px" : size === "sm" ? "36px" : "48px"}
          className="object-contain p-1.5"
        />
      </div>
      <div className="leading-tight">
        <div className={`font-display font-bold ${text}`} style={{ color: b.primary }}>{b.logoText}</div>
        {size !== "sm" && <div className="text-xs text-muted-foreground italic">{b.tagline}</div>}
      </div>
    </div>
  );
}

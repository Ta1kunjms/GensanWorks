import { cn } from "@/lib/utils";

export const BRAND_TAGLINE = "Official Job Assistance Platform of PESO – General Santos City";

type BrandSignatureProps = {
  showTagline?: boolean;
  tone?: "default" | "sidebar";
  align?: "left" | "center";
  className?: string;
};

const toneTokens = {
  default: {
    subline: "text-slate-400 tracking-widest font-semibold",
    tagline: "text-slate-300",
    bg: "bg-gradient-to-br from-blue-700 via-blue-500 to-blue-400 shadow-lg",
  },
  sidebar: {
    subline: "text-sidebar-foreground/70 tracking-widest font-semibold",
    tagline: "text-sidebar-foreground/60",
    bg: "bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400 shadow-lg",
  },
};

export function BrandSignature({
  showTagline = true,
  tone = "default",
  align = "left",
  className,
}: BrandSignatureProps) {
  const palette = toneTokens[tone];
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={cn("flex flex-col gap-2", alignment, className)}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl">
          <img src="/peso-gsc-logo.png" alt="PESO Gensan Logo" className="h-12 w-12" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className={cn("text-2xl font-bold tracking-tight", tone === "sidebar" ? "text-sidebar-foreground" : "text-blue-600") }>
            <span className="text-blue-600 font-bold">Gensan</span>
            <span className="text-red-500 font-bold">Works</span>
          </span>
          <span className={cn("text-xs uppercase mt-1", palette.subline)}>
            PESO GENSAN
          </span>
        </div>
      </div>
      {showTagline && (
        <p className={cn("text-sm leading-snug mt-2 max-w-xs", palette.tagline)}>
          {BRAND_TAGLINE}
        </p>
      )}
    </div>
  );
}

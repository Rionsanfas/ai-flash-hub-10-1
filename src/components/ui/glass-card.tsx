import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassCardVariants = cva(
  "glass rounded-2xl border backdrop-blur-md transition-all duration-400 ease-smooth",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-glass",
        hover: "bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-glass hover:scale-105 hover:shadow-glow hover:from-white/15 hover:to-white/10 cursor-pointer",
        glow: "bg-gradient-to-br from-white/15 to-white/10 border-white/30 shadow-glow animate-glow-pulse",
        subtle: "bg-gradient-to-br from-white/5 to-white/2 border-white/10 shadow-glass-sm",
        strong: "bg-gradient-to-br from-white/20 to-white/15 border-white/30 shadow-glass-md backdrop-blur-lg",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: React.ReactNode
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        className={cn(glassCardVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard, glassCardVariants }
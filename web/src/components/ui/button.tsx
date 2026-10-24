import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui restilizado para os tokens v2: cantos retos, borda de 2 px, sombra dura, alvo de 48 px, sem opacidade.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 border-2 font-display font-semibold transition-colors duration-(--du-motion-fast) ease-du-out select-none disabled:pointer-events-none disabled:border-disabled disabled:bg-disabled disabled:text-muted-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-bg bg-action text-bg shadow-block-button hover:bg-action-hover active:bg-action-pressed active:shadow-block-button-pressed",
        outline: "border-border bg-surface text-text hover:bg-raised",
        ghost: "border-transparent bg-transparent text-text hover:bg-raised",
      },
      size: {
        default: "min-h-12 px-5 py-2 text-base",
        sm: "min-h-12 px-3 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };

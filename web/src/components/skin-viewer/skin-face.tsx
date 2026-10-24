import { asset } from "@/lib/asset";

// Skin 64×64 em 2D: recorte da cabeça de frente (8,8) com a camada do chapéu (40,8) por cima.
// É o fallback estático do 3D (brief §8). Sem `alt`, é decorativa (o texto fica no contêiner).
export function SkinFace({ src, alt, className = "size-24" }: { src: string; alt?: string; className?: string }) {
  const base = {
    backgroundImage: `url(${asset(src)})`,
    backgroundSize: "800% 800%",
    imageRendering: "pixelated" as const,
  };
  const a11y = alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };
  return (
    <div {...a11y} className={`relative shrink-0 ${className}`}>
      <div className="absolute inset-0" style={{ ...base, backgroundPosition: "14.2857% 14.2857%" }} />
      <div aria-hidden="true" className="absolute inset-0" style={{ ...base, backgroundPosition: "71.4286% 14.2857%" }} />
    </div>
  );
}

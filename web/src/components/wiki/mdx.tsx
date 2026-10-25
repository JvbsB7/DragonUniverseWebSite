import type { ComponentProps } from "react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";

// Corpo em Markdown simples, estilizado com os tokens do site.
const components = {
  h2: (p: ComponentProps<"h2">) => <h2 className="mt-10 mb-3" {...p} />,
  h3: (p: ComponentProps<"h3">) => <h3 className="mt-6 mb-2 text-xl" {...p} />,
  p: (p: ComponentProps<"p">) => <p className="my-4 max-w-prose" {...p} />,
  ul: (p: ComponentProps<"ul">) => <ul className="my-4 max-w-prose list-disc space-y-1 pl-6 marker:text-brand" {...p} />,
  ol: (p: ComponentProps<"ol">) => <ol className="my-4 max-w-prose list-decimal space-y-1 pl-6 marker:text-brand" {...p} />,
  strong: (p: ComponentProps<"strong">) => <strong className="font-semibold text-text" {...p} />,
  code: (p: ComponentProps<"code">) => <code className="rounded-sm bg-raised px-1.5 py-0.5 text-[0.95em]" {...p} />,
  blockquote: (p: ComponentProps<"blockquote">) => <blockquote className="my-4 max-w-prose border-l-4 border-brand pl-4 text-muted-foreground" {...p} />,
  table: (p: ComponentProps<"table">) => (
    <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm" {...p} /></div>
  ),
  th: (p: ComponentProps<"th">) => <th className="border-b border-edge px-3 py-2 font-display" {...p} />,
  td: (p: ComponentProps<"td">) => <td className="border-b border-border px-3 py-2" {...p} />,
  a: ({ href = "", ...p }: ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} className="text-brand underline underline-offset-4" {...p} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-4" {...p} />
    ),
};

export function WikiMdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }} />;
}

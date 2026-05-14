"use client";

import { useEffect, useId, useState } from "react";

// Mermaid is dynamically imported because it's heavy (~500KB).
// Loading it client-side only on case-study pages keeps the home page bundle clean.

interface Props {
  code: string;
  caption?: string;
}

export default function MermaidDiagram({ code, caption }: Props) {
  const reactId = useId();
  const safeId = `mermaid-${reactId.replace(/:/g, "-")}`;
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;

        // Theme tuned to the portfolio's dark accent palette.
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, sans-serif',
          themeVariables: {
            background: "#0a0a0a",
            primaryColor: "#0e1014",
            primaryTextColor: "#e6e6e6",
            primaryBorderColor: "#1f2937",
            lineColor: "#4b5563",
            secondaryColor: "#0f172a",
            tertiaryColor: "#06182040",
            edgeLabelBackground: "#0a0a0a",
            clusterBkg: "#0e1014",
            clusterBorder: "#06b6d433",
            mainBkg: "#111827",
            nodeBorder: "#06b6d4",
            // Accent strokes & arrowheads
            defaultLinkColor: "#06b6d4",
            titleColor: "#e6e6e6",
          },
          flowchart: {
            curve: "basis",
            padding: 20,
            useMaxWidth: true,
            htmlLabels: true,
          },
        });

        const { svg: rendered } = await mermaid.render(safeId, code);
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        console.error("[MermaidDiagram] render failed:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Render failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, safeId]);

  return (
    <figure className="my-10">
      <div className="rounded-2xl border border-border bg-surface-light/30 backdrop-blur-sm p-6 sm:p-10 overflow-x-auto">
        {error ? (
          <div className="text-sm text-amber-400/80">
            Diagram failed to render: {error}
          </div>
        ) : svg ? (
          <div
            className="mermaid-rendered flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            // The SVG is generated server-side by mermaid; the input is our own
            // Mermaid code from portfolio.ts (no user input).
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <div className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            Loading diagram&hellip;
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-text-muted mt-4 max-w-3xl mx-auto leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

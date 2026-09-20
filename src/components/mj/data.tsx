"use client";

/* ============================================================
   MDS v4 — data.tsx
   Status language (DESIGN.md §5), model/tool chips, shared rows.
   Data comes from @minsaj/mock-api via server components; these
   are presentation-only helpers used across pages.
   ============================================================ */

import type { ReactNode } from "react";
import { Badge, Dot } from "./primitives";
import type { RunStatus } from "@minsaj/contracts";

/* run/agent status → dot tone (label text comes from dictionary.status) */
export function RunStatusBadge({ status, label }: { status: RunStatus; label: string }) {
  const tone =
    status === "running" ? "accent" :
    status === "completed" ? "success" :
    status === "completed_with_warnings" ? "success" :
    status === "failed_retryable" ? "danger" :
    status === "planning" || status === "waiting_for_input" || status === "waiting_for_approval" ? "warning" :
    "neutral";
  const dotTone =
    tone === "accent" ? "accent" : tone === "success" ? "success" :
    tone === "danger" ? "danger" : tone === "warning" ? "warning" : undefined;
  const pulse = status === "running" || status === "planning";
  return (
    <Badge tone={tone === "neutral" ? "neutral" : tone === "accent" ? "accent" : tone}>
      <Dot tone={dotTone} pulse={pulse} />
      {label}
    </Badge>
  );
}

export function ModelChip({ name, provider }: { name: string; provider: string }) {
  return (
    <span className="mj-badge mj-badge--outline">
      <bdi dir="ltr" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{name}</bdi>
      <span style={{ color: "var(--ink-4)" }}>·</span>
      <bdi dir="ltr">{provider}</bdi>
    </span>
  );
}

export function RiskBadge({ risk, labels }: {
  risk: "read" | "write_internal" | "external_side_effect" | "destructive";
  labels: Record<typeof risk, string>;
}) {
  const tone = risk === "read" ? "neutral" : risk === "write_internal" ? "warning" : "danger";
  return <Badge tone={tone === "neutral" ? "neutral" : tone}>{labels[risk]}</Badge>;
}

export function PayerBadge({ payer, labels }: {
  payer: "platform_credits" | "byok" | "mixed";
  labels: Record<typeof payer, string>;
}) {
  return <Badge tone="outline">{labels[payer]}</Badge>;
}

/* provider logo mark — 1-2 letter monogram, no invented logos */
export function ProviderMark({ name }: { name: string }) {
  return (
    <span className="mj-avatar mj-avatar--sm" aria-hidden>
      <bdi dir="ltr">{name.slice(0, 2).toUpperCase()}</bdi>
    </span>
  );
}

export function DefinitionList({ items }: { items: { term: string; value: ReactNode }[] }) {
  return (
    <dl style={{ display: "grid", gap: 12 }}>
      {items.map((i) => (
        <div key={i.term} style={{ display: "grid", gap: 4 }}>
          <dt className="mj-caption">{i.term}</dt>
          <dd className="mj-body-s" style={{ color: "var(--ink)" }}>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

"use client";

/* ============================================================
   MDS v4 — Chat («اسأل») — immersive route
   Full-height conversation: scroll region + pinned composer.
   Model selector, cost visibility, streaming-ready bubbles.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, Bot, Paperclip, Plus, Send, Square } from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import type { Dictionary } from "@minsaj/i18n";
import { Badge, IconButton } from "./primitives";
import { ModelChip } from "./data";
import { cn } from "@minsaj/ui";

type Msg = { id: number; role: "user" | "ai"; text: string; meta?: string };

const MODELS = [
  { id: "mdl_clarity", name: "Clarity Pro", provider: "Northstar" },
  { id: "mdl_sprint", name: "Sprint Mini", provider: "Vertex Lane" },
  { id: "mdl_depth", name: "Depth Reasoner", provider: "Cedar Labs" },
];

export function MjChat({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const isAr = locale === "ar";
  const t = chatLabels(isAr, dictionary);
  const params = useSearchParams();
  const [model, setModel] = useState(params.get("model") ?? "mdl_clarity");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, role: "user", text: isAr
        ? "قارن بين أفضل نموذجين لتحليل المقابلات الطويلة، مع تقدير التكلفة لكل ألف كلمة."
        : "Compare the two best models for long interview analysis, with a cost estimate per thousand words." },
    { id: 2, role: "ai", text: isAr
        ? "للمقابلات الطويلة ( أكثر من ٨ آلاف كلمة) أنصح بالبدء بـ Depth Reasoner للاستخلاص العميق ثم Sprint Mini للتلخيص السريع. التقدير التقريبي: النموذج الأول 0.42$ لكل ألف كلمة، والثاني 0.07$. أبقي المصدر ومصدر الدفع ظاهرين في كل رد."
        : "For long interviews (8k+ words) start with Depth Reasoner for deep extraction, then Sprint Mini for fast summarization. Rough estimate: $0.42 per thousand words for the former, $0.07 for the latter. Provider and payer stay visible on every reply.",
      meta: isAr ? "Clarity Pro · رصيد المنصة · 0.12$" : "Clarity Pro · Platform credits · $0.12" },
  ]);

  /* keep pinned to bottom while user is there */
  useEffect(() => {
    if (atBottom && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, atBottom]);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }

  function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    setSending(true);
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, role: "ai",
        text: isAr
          ? "جاهز. سأقسم المهمة إلى خطة من ثلاث خطوات مع حدود واضحة للتكلفة، وأعرضها عليك قبل التنفيذ — أي أثر خارجي سيبقى خلف موافقتك."
          : "Ready. I'll split the task into a three-step plan with explicit cost limits and show it to you before executing — any external effect stays behind your approval.",
        meta: isAr ? "Clarity Pro · رصيد المنصة · 0.09$" : "Clarity Pro · Platform credits · $0.09",
      }]);
      setSending(false);
    }, 900);
  }

  const Arrow = isAr ? ArrowRight : ArrowLeft;
  const activeModel = MODELS.find((m) => m.id === model) ?? MODELS[0];

  return (
    <div className="mj-chat">
      {/* chat header — thin, contextual */}
      <div className="mj-topbar" style={{ position: "sticky", top: 0 }}>
        <Link href={`/${locale}/app/home`} className="mj-icon-btn" aria-label={t.backHome}><Arrow size={18} /></Link>
        <span className="mj-topbar__crumb"><b>{t.title}</b></span>
        <div className="mj-topbar__actions" style={{ gap: 6 }}>
          <ModelPicker models={MODELS} value={model} onChange={setModel} label={t.model} />
          <Link href={`/${locale}/app/chat?action=new`} className="mj-icon-btn" aria-label={t.newChat}><Plus size={17} /></Link>
        </div>
      </div>

      {/* messages */}
      <div className="mj-chat__scroll" ref={scroller} onScroll={onScroll} role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} style={{ display: "grid", gap: 6 }}>
            {m.role === "ai" ? (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <span className="mj-avatar"><Bot size={16} /></span>
                <div className="mj-bubble mj-bubble--ai">
                  {m.text}
                  {m.meta ? <span className="mj-bubble--meta"><bdi dir="ltr">{m.meta}</bdi></span> : null}
                </div>
              </div>
            ) : (
              <div className="mj-bubble mj-bubble--user">{m.text}</div>
            )}
          </div>
        ))}
        {sending ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--ink-3)" }}>
            <span className="mj-avatar"><Bot size={16} /></span>
            <span className="mj-skel" style={{ width: 120, height: 14 }} />
          </div>
        ) : null}
      </div>

      {/* jump to latest */}
      {!atBottom ? (
        <button type="button" className="mj-icon-btn" onClick={() => { setAtBottom(true); if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }}
          aria-label={t.latest}
          style={{ position: "absolute", insetBlockEnd: 120, insetInlineEnd: 20, background: "var(--raised)", border: "1px solid var(--line-strong)", zIndex: "var(--z-dropdown)" } as React.CSSProperties}>
          <ArrowDown size={16} />
        </button>
      ) : null}

      {/* composer */}
      <div className="mj-composer">
        <div className="mj-composer__box">
          <IconButton label={t.attach} size="sm"><Paperclip size={16} /></IconButton>
          <textarea
            rows={1}
            dir="auto"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
          />
          <button type="button" className={cn("mj-btn", "mj-btn--primary")} onClick={send} disabled={!draft.trim() || sending} aria-label={t.send}
            style={{ paddingInline: 12 }}>
            {sending ? <Square size={14} /> : <Send size={15} className={isAr ? "mj-flip" : undefined} />}
          </button>
        </div>
        <div className="mj-composer__tools">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ModelChip name={activeModel.name} provider={activeModel.provider} /></span>
          <span>{t.costHint}</span>
          <span style={{ marginInlineStart: "auto" }} className="mj-kbd">⏎ {t.send} · Shift+⏎ {t.newline}</span>
        </div>
      </div>
    </div>
  );
}

function ModelPicker({ models, value, onChange, label }: { models: { id: string; name: string; provider: string }[]; value: string; onChange: (v: string) => void; label: string }) {
  const active = models.find((m) => m.id === value) ?? models[0];
  return (
    <label className="mj-badge mj-badge--outline mj-modelpick" style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
      <span className="mj-modelpick__word" style={{ color: "var(--ink-3)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{ background: "none", border: "none", outline: "none", color: "var(--ink)", font: "inherit", cursor: "pointer", maxWidth: 110, textOverflow: "ellipsis" }}
      >
        {models.map((m) => <option key={m.id} value={m.id} style={{ background: "var(--raised)" }}>{m.name}</option>)}
      </select>
      <bdi dir="ltr" className="mj-modelpick__prov" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)" }}>{active.provider}</bdi>
    </label>
  );
}

function chatLabels(isAr: boolean, dictionary: Dictionary) {
  return isAr ? {
    title: dictionary.nav.chat, backHome: "العودة إلى الرئيسية", newChat: "محادثة جديدة",
    model: "النموذج", attach: "إرفاق ملف", send: "إرسال", newline: "سطر جديد",
    placeholder: "اكتب سؤالك — Shift+Enter لسطر جديد", latest: "انتقل إلى الأحدث",
    costHint: "المزود ومصدر الدفع ظاهران في كل رد",
  } : {
    title: dictionary.nav.chat, backHome: "Back to home", newChat: "New chat",
    model: "Model", attach: "Attach file", send: "Send", newline: "new line",
    placeholder: "Ask anything — Shift+Enter for a new line", latest: "Jump to latest",
    costHint: "Provider and payer visible on every reply",
  };
}

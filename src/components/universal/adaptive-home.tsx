"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  BookOpenCheck,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  Code2,
  Compass,
  GraduationCap,
  LoaderCircle,
  MessageCircle,
  Mic,
  Palette,
  Paperclip,
  Plus,
  SearchCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { Locale } from "@minsaj/contracts";
import { ActivityFeedback, FeedbackToast } from "@/components/universal/activity-feedback";
import { universalServices, type UniversalServiceId } from "@/lib/universal-content";

import { ScrollFx } from "@/components/universal/scroll-fx";
const serviceIcons = {
  ask: MessageCircle,
  learn: GraduationCap,
  research: SearchCheck,
  create: Palette,
  code: Code2,
  analyze: ChartNoAxesCombined,
  explore: Compass,
} satisfies Record<UniversalServiceId, typeof MessageCircle>;

const defaultGoals: UniversalServiceId[] = ["learn", "research", "explore"];

export function AdaptiveHome({ locale }: { locale: Locale }) {
  const services = universalServices[locale];
  const isArabic = locale === "ar";
  const [activeId, setActiveId] = useState<UniversalServiceId>("ask");
  const [prompt, setPrompt] = useState("");
  const [runState, setRunState] = useState<"idle" | "thinking" | "ready" | "error">("idle");
  const [toast, setToast] = useState("");
  const [goals, setGoals] = useState<UniversalServiceId[]>(defaultGoals);
  const [draftGoals, setDraftGoals] = useState<UniversalServiceId[]>(defaultGoals);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const active = services.find((service) => service.id === activeId) ?? services[0]!;
  const ActiveIcon = serviceIcons[active.id];

  const copy = isArabic
    ? {
        eyebrow: "مساحتك اليوم",
        greeting: "مرحبًا، ماذا تريد أن تنجز؟",
        intro: "اختر اتجاهًا أو اكتب بطريقتك. منسج سيهيئ المساحة والأدوات المناسبة دون أن يربكك بالتفاصيل.",
        customize: "خصّص تجربتي",
        change: "تغيير",
        start: "ابدأ",
        attach: "إرفاق ملف",
        voice: "تحدث",
        preparing: "منسج يحدد أفضل مسار…",
        preparingShort: "جارٍ التهيئة",
        simulation: "محاكاة واضحة",
        progress: "تهيئة مساحة المهمة",
        validationLabel: "الطلب يحتاج توضيحًا",
        validationTitle: "اكتب ما تريد إنجازه أولًا",
        validationBody: "اكتب طلبًا قصيرًا أو اختر واحدة من البدايات المقترحة، ثم حاول مجددًا.",
        returnToPrompt: "اكتب الطلب",
        understood: "تم فهم مقصدك",
        open: "افتح المساحة",
        clear: "ابدأ فكرة أخرى",
        servicesLabel: "كل ما يمكنك فعله",
        servicesTitle: "سبع مساحات، وسياق واحد.",
        servicesBody: "انتقل بينها دون أن تبدأ من الصفر؛ منسج يحتفظ بما تختاره أنت فقط.",
        recommended: "مقترح لك",
        seeAll: "استكشف الكل",
        continueLabel: "تابع من حيث توقفت",
        continueTitle: "أعمالك الأخيرة",
        saved: "محفوظ تلقائيًا",
        minutes: "دقائق",
        why: "لماذا أرى هذا؟",
        whyBody: "لأنك اخترت التعلّم والبحث والاستكشاف. يمكنك تغيير ذلك في أي وقت.",
        onboardingTitle: "ما الذي تريد أن يساعدك فيه منسج؟",
        onboardingBody: "اختر أهدافًا لا مهنة. سنقدّم هذه المساحات أولًا، ويمكنك استخدام بقية الخدمات دائمًا.",
        onboardingHint: "يمكنك اختيار أكثر من هدف وتغييره لاحقًا.",
        cancel: "ليس الآن",
        save: "احفظ تجربتي",
        personal: "مساحة شخصية",
        privacy: "تفضيلاتك محلية في هذا النموذج ولا تُرسل لأي مزود.",
        goalsSaved: "تم تحديث أهدافك محليًا وترتيب المساحات وفقها.",
        dismissFeedback: "إغلاق رسالة التأكيد",
      }
    : {
        eyebrow: "Your space today",
        greeting: "Hello, what would you like to accomplish?",
        intro: "Choose a direction or write naturally. Minsaj prepares the right space and tools without overwhelming you with setup.",
        customize: "Personalize my experience",
        change: "Change",
        start: "Start",
        attach: "Attach a file",
        voice: "Talk",
        preparing: "Minsaj is finding the best path…",
        preparingShort: "Preparing",
        simulation: "Explicit simulation",
        progress: "Preparing the task space",
        validationLabel: "Your request needs a little more detail",
        validationTitle: "Write what you want to accomplish first",
        validationBody: "Enter a short request or choose a suggested starting point, then try again.",
        returnToPrompt: "Write my request",
        understood: "Intent understood",
        open: "Open the space",
        clear: "Start another idea",
        servicesLabel: "Everything you can do",
        servicesTitle: "Seven spaces, one context.",
        servicesBody: "Move between them without starting over; Minsaj retains only what you choose.",
        recommended: "Recommended for you",
        seeAll: "Explore all",
        continueLabel: "Continue where you left off",
        continueTitle: "Your recent work",
        saved: "Autosaved",
        minutes: "min",
        why: "Why am I seeing this?",
        whyBody: "Because you selected learning, research, and discovery. Change this whenever you want.",
        onboardingTitle: "What should Minsaj help you with?",
        onboardingBody: "Choose goals, not a profession. We will bring these spaces forward, while every service remains available.",
        onboardingHint: "Choose more than one and change them later.",
        cancel: "Not now",
        save: "Save my experience",
        personal: "Personal space",
        privacy: "Your choices stay local in this prototype and are not sent to a provider.",
        goalsSaved: "Your goals were updated locally and the spaces were reordered around them.",
        dismissFeedback: "Dismiss confirmation",
      };

  useEffect(() => {
    const saved = window.localStorage.getItem("minsaj.universal.goals");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as UniversalServiceId[];
      const valid = parsed.filter((id) => services.some((service) => service.id === id));
      if (!valid.length) return;
      const restoreTimer = window.setTimeout(() => {
        setGoals(valid);
        setDraftGoals(valid);
      }, 0);
      return () => window.clearTimeout(restoreTimer);
    } catch {
      window.localStorage.removeItem("minsaj.universal.goals");
    }
  }, [services]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function cancelPendingRun() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function chooseService(id: UniversalServiceId) {
    cancelPendingRun();
    setActiveId(id);
    setPrompt("");
    setRunState("idle");
  }

  function startTask() {
    cancelPendingRun();
    if (!prompt.trim()) {
      setRunState("error");
      window.requestAnimationFrame(() => textareaRef.current?.focus());
      return;
    }
    setRunState("thinking");
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setRunState("ready");
    }, 760);
  }

  function toggleDraftGoal(id: UniversalServiceId) {
    setDraftGoals((current) => current.includes(id) ? current.filter((goal) => goal !== id) : [...current, id]);
  }

  function saveGoals() {
    const next = draftGoals.length ? draftGoals : defaultGoals;
    setGoals(next);
    window.localStorage.setItem("minsaj.universal.goals", JSON.stringify(next));
    setPersonalizeOpen(false);
    setToast(copy.goalsSaved);
  }

  const orderedServices = [...services].sort((a, b) => Number(goals.includes(b.id)) - Number(goals.includes(a.id)));
  const recentCards = isArabic
    ? [
        { title: "خطة تعلّم أساسيات علم البيانات", type: "تعلّم", meta: "آخر تعديل قبل 18 دقيقة", icon: BookOpenCheck, service: "learn" },
        { title: "مقارنة مصادر الطاقة المتجددة", type: "بحث", meta: "12 مصدرًا · مسودة أولى", icon: SearchCheck, service: "research" },
        { title: "واجهة تطبيق نادي القراءة", type: "برمجة وصناعة", meta: "معاينة جاهزة", icon: Code2, service: "code" },
      ]
    : [
        { title: "Learn the foundations of data science", type: "Learning", meta: "Edited 18 minutes ago", icon: BookOpenCheck, service: "learn" },
        { title: "Compare renewable energy sources", type: "Research", meta: "12 sources · first draft", icon: SearchCheck, service: "research" },
        { title: "Reading club app interface", type: "Code & create", meta: "Preview ready", icon: Code2, service: "code" },
      ];

  return (
    <Dialog.Root open={personalizeOpen} onOpenChange={(open) => { setPersonalizeOpen(open); if (open) setDraftGoals(goals); }}>
      <div className="adaptive-home">
        <ScrollFx />
        <section className="adaptive-home__hero" data-service={active.id}>
          <div className="adaptive-home__ambient adaptive-home__ambient--one" />
          <div className="adaptive-home__ambient adaptive-home__ambient--two" />
          <header className="adaptive-home__welcome">
            <div>
              <span className="adaptive-home__eyebrow">{copy.eyebrow}<i />{copy.personal}</span>
              <h1>{copy.greeting}</h1>
              <p>{copy.intro}</p>
            </div>
            <Dialog.Trigger asChild><button type="button" className="adaptive-personalize"><SlidersHorizontal size={16} />{copy.customize}</button></Dialog.Trigger>
          </header>

          <div className="adaptive-task-card">
            <div className="adaptive-task-modes" role="tablist" aria-label={isArabic ? "اختر اتجاه المهمة" : "Choose a task direction"}>
              {orderedServices.map((service) => {
                const Icon = serviceIcons[service.id];
                return (
                  <button key={service.id} role="tab" aria-label={service.shortLabel} aria-selected={active.id === service.id} type="button" onClick={() => chooseService(service.id)} className={active.id === service.id ? "is-active" : ""}>
                    <Icon size={16} /><span>{service.shortLabel}</span>
                    {goals.includes(service.id) ? <i className="adaptive-task-modes__mark" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
            <div className="adaptive-task-composer">
              <div className="adaptive-task-composer__icon"><ActiveIcon size={20} /></div>
              <textarea ref={textareaRef} rows={2} value={prompt} onChange={(event) => { cancelPendingRun(); setPrompt(event.target.value); setRunState("idle"); }} placeholder={active.prompt} aria-label={active.prompt} aria-invalid={runState === "error"} aria-describedby={runState === "error" ? "adaptive-task-error" : undefined} />
              <div className="adaptive-task-composer__actions">
                <div><button type="button" title={copy.attach} aria-label={copy.attach}><Paperclip size={18} /></button><button type="button" title={copy.voice} aria-label={copy.voice}><Mic size={18} /></button><span>{active.eyebrow}</span></div>
                <button type="button" className="adaptive-task-submit" onClick={startTask} disabled={runState === "thinking"} data-loading={runState === "thinking"}><span>{runState === "thinking" ? copy.preparingShort : copy.start}</span>{runState === "thinking" ? <LoaderCircle size={18} /> : <ArrowUp size={18} />}</button>
              </div>
            </div>
            {runState === "thinking" ? <ActivityFeedback state="working" className="adaptive-thinking" label={copy.simulation} title={copy.preparing} description={active.eyebrow} progressLabel={copy.progress} /> : null}
            {runState === "ready" ? (
              <ActivityFeedback
                state="success"
                className="adaptive-ready"
                label={`${copy.understood} · ${active.eyebrow}`}
                title={active.outputTitle}
                description={active.outputBody}
                action={<><Link href={`/${locale}/app/${active.slug}`}>{copy.open}<ArrowLeft size={16} /></Link><button type="button" onClick={() => { cancelPendingRun(); setPrompt(""); setRunState("idle"); }}>{copy.clear}</button></>}
              />
            ) : null}
            {runState === "error" ? <ActivityFeedback id="adaptive-task-error" state="error" label={copy.validationLabel} title={copy.validationTitle} description={copy.validationBody} action={<button type="button" onClick={() => textareaRef.current?.focus()}>{copy.returnToPrompt}</button>} /> : null}
            {runState === "idle" ? (
              <div className="adaptive-starters">
                {active.starters.map((starter) => <button type="button" onClick={() => { setPrompt(starter); setRunState("idle"); }} key={starter}>{starter}<ArrowLeft size={14} /></button>)}
              </div>
            ) : null}
          </div>
        </section>

        <section className="adaptive-section adaptive-services-home" aria-labelledby="adaptive-services-title">
          <div className="adaptive-section__head">
            <div><span>{copy.servicesLabel}</span><h2 id="adaptive-services-title">{copy.servicesTitle}</h2><p>{copy.servicesBody}</p></div>
            <Link href={`/${locale}/app/explore`}>{copy.seeAll}<ArrowLeft size={16} /></Link>
          </div>
          <div className="adaptive-service-grid">
            {orderedServices.map((service) => {
              const Icon = serviceIcons[service.id];
              const preferred = goals.includes(service.id);
              return (
                <Link href={`/${locale}/app/${service.slug}`} data-service={service.id} className="adaptive-service-tile" key={service.id}>
                  <div><span><Icon size={20} /></span>{preferred ? <small>{copy.recommended}</small> : null}<ArrowLeft size={16} /></div>
                  <h3>{service.label}</h3><p>{service.description}</p>
                  <span className="adaptive-service-tile__sample">{service.starters[0]}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="adaptive-section adaptive-recents" aria-labelledby="adaptive-recents-title">
          <div className="adaptive-section__head">
            <div><span>{copy.continueLabel}</span><h2 id="adaptive-recents-title">{copy.continueTitle}</h2></div>
            <Link href={`/${locale}/app/library`}>{isArabic ? "افتح مكتبتي" : "Open my library"}<ArrowLeft size={16} /></Link>
          </div>
          <div className="adaptive-recent-grid">
            {recentCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link href={`/${locale}/app/${card.service}`} className="adaptive-recent-card" key={card.title}>
                  <div className={`adaptive-recent-card__cover adaptive-recent-card__cover--${index + 1}`}><Icon size={26} /></div>
                  <div className="adaptive-recent-card__body"><span>{card.type}</span><h3>{card.title}</h3><p>{card.meta}</p><small><CheckCircle2 size={12} />{copy.saved}</small></div>
                </Link>
              );
            })}
            <aside className="adaptive-why-card">
              <span><Sparkles size={18} /></span><h3>{copy.why}</h3><p>{copy.whyBody}</p><Dialog.Trigger asChild><button type="button">{copy.change}<ArrowLeft size={14} /></button></Dialog.Trigger>
            </aside>
          </div>
        </section>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="adaptive-dialog-overlay" />
        <Dialog.Content className="adaptive-dialog" aria-describedby="adaptive-dialog-description">
          <div className="adaptive-dialog__head">
            <span><Sparkles size={20} /></span>
            <div><Dialog.Title>{copy.onboardingTitle}</Dialog.Title><Dialog.Description id="adaptive-dialog-description">{copy.onboardingBody}</Dialog.Description></div>
            <Dialog.Close asChild><button type="button" aria-label={isArabic ? "إغلاق" : "Close"}><X size={18} /></button></Dialog.Close>
          </div>
          <p className="adaptive-dialog__hint">{copy.onboardingHint}</p>
          <div className="adaptive-dialog__goals">
            {services.filter((service) => service.id !== "ask").map((service) => {
              const Icon = serviceIcons[service.id];
              const selected = draftGoals.includes(service.id);
              return <button type="button" data-service={service.id} className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => toggleDraftGoal(service.id)} key={service.id}><span><Icon size={18} /></span><div><strong>{service.label}</strong><small>{service.description}</small></div><i>{selected ? <Check size={14} /> : <Plus size={14} />}</i></button>;
            })}
          </div>
          <div className="adaptive-dialog__privacy"><CheckCircle2 size={16} />{copy.privacy}</div>
          <div className="adaptive-dialog__actions"><Dialog.Close asChild><button type="button" className="adaptive-dialog__cancel">{copy.cancel}</button></Dialog.Close><button type="button" className="adaptive-dialog__save" onClick={saveGoals}>{copy.save}<ArrowLeft size={16} /></button></div>
        </Dialog.Content>
      </Dialog.Portal>
      {toast ? <FeedbackToast message={toast} closeLabel={copy.dismissFeedback} onDismiss={() => setToast("")} /> : null}
    </Dialog.Root>
  );
}

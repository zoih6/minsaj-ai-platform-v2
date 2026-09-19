"use client";

/* ------------------------------------------------------------------
   BrandMotion — the owner's official identity motion film, made
   interactive on the marketing home (Apple-style scroll scrubbing).

   Studied practices baked in (researched 2026-09-18):
   - Scroll-scrub: video.currentTime is driven by scroll progress
     through a tall track + sticky stage (Apple AirPods pattern).
   - Smoothed seeking: rAF lerp toward the target time so the weave
     feels fluid instead of snapping between keyframes.
   - iOS Safari unlock: currentTime seeking does nothing until the
     video has played once → play() then pause() on first view.
   - Perf: IntersectionObserver starts/stops the rAF loop; the video
     is fully inert (paused, muted) outside the viewport.
   - A11y: prefers-reduced-motion swaps the film for the final still
     with all chapters readable, no pinning; the video itself is
     decorative (aria-hidden) — chapters carry the narrative.
   - Encoding: H.264 with a keyframe at EVERY frame (-g 1) so both
     directions of scrub decode instantly.
   ------------------------------------------------------------------ */

import { useEffect, useRef } from "react";
import type { Locale } from "@minsaj/contracts";

const VIDEO_SRC = "/brand/motion/minsaj-motion-720.mp4";
const POSTER_SRC = "/brand/motion/minsaj-motion-poster.webp";
const STILL_SRC = "/brand/motion/minsaj-motion-still.webp";
/** Scrub never quite reaches the last frame — a 60ms headroom keeps
 *  the end state composed instead of flickering on the cut. */
const TIME_HEADROOM = 0.06;
/** Chapter boundaries as scroll-progress fractions. */
const CHAPTERS_AT = [0, 0.34, 0.67];

export function BrandMotion({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const trackRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const copy = isArabic
    ? {
        sectionLabel: "قصة هوية منسج",
        chapters: [
          { kicker: "٠١ · البذرة", title: "يبدأ كل شيء بخيط واحد", body: "هدفك أنت هو أول خيط — سؤال، فكرة، أو مشروع تريد إنجازه." },
          { kicker: "٠٢ · النسيج", title: "تتشابك الخيوط وتتقوى", body: "المعرفة والأدوات والمصادر تتقاطع في مسار واحد متماسك حول هدفك." },
          { kicker: "٠٣ · الهوية", title: "تكتمل الصورة", body: "منسج — المنصة التي تنسج الذكاء من أجلك، خيطًا فوق خيط." },
        ],
        hint: "مرّر لتنسج القصة",
      }
    : {
        sectionLabel: "The story of the Minsaj identity",
        chapters: [
          { kicker: "01 · The seed", title: "It all starts with one thread", body: "Your goal is the first thread — a question, an idea, or a project you want done." },
          { kicker: "02 · The weave", title: "Threads cross and strengthen", body: "Knowledge, tools, and sources intersect into one coherent path around your goal." },
          { kicker: "03 · The identity", title: "The picture completes", body: "Minsaj — the platform that weaves intelligence for you, thread over thread." },
        ],
        hint: "Scroll to weave the story",
      };

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const card = cardRef.current;
    if (!track || !stage || !video || !card) return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    let raf = 0;
    let running = false;
    let unlocked = false;
    let current = 0;          // smoothed progress 0..1
    let targetChapter = -1;
    // pointer parallax state
    let px = 0, py = 0, tx = 0, ty = 0;

    const duration = () => {
      const d = video.duration;
      return Number.isFinite(d) && d > 0 ? d : 8;
    };

    const setChapter = (index: number) => {
      if (index === targetChapter) return;
      targetChapter = index;
      const chapters = stage.querySelectorAll<HTMLElement>(".brand-motion__chapter");
      chapters.forEach((node, i) => {
        node.toggleAttribute("data-active", i === index);
      });
    };

    const unlockIOS = () => {
      if (unlocked) return;
      unlocked = true;
      const attempt = video.play();
      if (attempt && typeof attempt.then === "function") {
        attempt.then(() => video.pause()).catch(() => {});
      } else {
        video.pause();
      }
    };

    const frame = () => {
      if (!running) return;
      const rect = track.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      const progress = runway > 0 ? Math.min(1, Math.max(0, -rect.top / runway)) : 0;

      // smoothed scrub
      current += (progress - current) * 0.16;
      if (Math.abs(progress - current) < 0.0008) current = progress;
      const time = current * (duration() - TIME_HEADROOM);
      if (video.readyState >= 2 && Math.abs(video.currentTime - time) > 0.012) {
        try { video.currentTime = time; } catch { /* seek race */ }
      }

      // progress rail + hint
      stage.style.setProperty("--bm-progress", current.toFixed(4));
      stage.toggleAttribute("data-started", current > 0.02);

      // chapters
      let chapter = 0;
      for (let i = 0; i < CHAPTERS_AT.length; i += 1) {
        if (current >= CHAPTERS_AT[i]!) chapter = i;
      }
      setChapter(chapter);

      // pointer parallax (fine pointers only)
      if (finePointerQuery.matches && !reduceQuery.matches) {
        px += (tx - px) * 0.08;
        py += (ty - py) * 0.08;
        card.style.transform = `translate3d(${(px * 8).toFixed(2)}px, ${(py * 6).toFixed(2)}px, 0)`;
      }

      raf = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduceQuery.matches) return;
      running = true;
      unlockIOS();
      raf = window.requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ty = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const applyReduced = () => {
      if (!reduceQuery.matches) return;
      stop();
      track.setAttribute("data-reduced", "");
      stage.style.setProperty("--bm-progress", "1");
      setChapter(copy.chapters.length - 1);
      const reveal = () => { try { video.currentTime = duration() - 0.1; } catch { /* noop */ } };
      if (video.readyState >= 1) reveal();
      else video.addEventListener("loadeddata", reveal, { once: true });
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) start(); else stop();
      }
    }, { rootMargin: "120px 0px 120px 0px" });
    observer.observe(track);

    if (finePointerQuery.matches && !reduceQuery.matches) {
      stage.addEventListener("pointermove", onPointerMove, { passive: true });
    }
    applyReduced();
    const onReduceChange = () => { if (reduceQuery.matches) applyReduced(); };
    reduceQuery.addEventListener("change", onReduceChange);

    return () => {
      stop();
      observer.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      reduceQuery.removeEventListener("change", onReduceChange);
    };
  }, []);

  return (
    <section ref={trackRef} className="brand-motion" aria-label={copy.sectionLabel}>
      <div ref={stageRef} className="brand-motion__stage">
        <div className="brand-motion__frame">
          <div ref={cardRef} className="brand-motion__card">
            <video
              ref={videoRef}
              className="brand-motion__video"
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              muted
              playsInline
              preload="auto"
              tabIndex={-1}
              aria-hidden="true"
              disablePictureInPicture
            />
            <img className="brand-motion__still" src={STILL_SRC} alt="" aria-hidden="true" decoding="async" />
            <span className="brand-motion__rail" aria-hidden="true"><span className="brand-motion__rail-fill" /></span>
          </div>
          <p className="brand-motion__hint"><span className="brand-motion__hint-arrow" aria-hidden="true">↓</span>{copy.hint}</p>
        </div>
        <div className="brand-motion__chapters">
          {copy.chapters.map((chapter) => (
            <div key={chapter.kicker} className="brand-motion__chapter">
              <span className="brand-motion__chapter-kicker">{chapter.kicker}</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

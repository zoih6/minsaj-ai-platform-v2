# Minsaj Polish Standards — مستخلصة من البحث (v23)

> المصادر: Vercel DESIGN.md (كامل), Raycast DESIGN.md (كامل) + Raycast blog, Linear
> (designmd/designlang/refero/byq snippets + redesign articles), Manus/Claude/Perplexity UX
> case studies, empty-state/skeleton research.
> **القاعدة الذهبية من المالك**: Keep the design. Fix the imperfections. Make every pixel
> feel intentional. المراجع للمبادئ فقط — لا تقليد.

## A. Surface & Elevation (Linear + Raycast)
- A1. الدارك = substrate وليس theme: سلم أسطح متدرج (canvas → surface → elevated → card)،
  كل درجة أفتح بدرجة واحدة بالضبط. لا ألوان أسطح يتيمة خارج السلم.
- A2. العمق من سلم الأسطح + hairline borders — ليس من drop-shadows ثقيلة.
- A3. أي ظل: stacked (طبقات صغيرة 1-8px بشفافية 4-12%) + inset hairline — أبداً ظل مفرد
  ثقيل blur كبير.
- A4. "الخلفيات والحدود والنص الثانوي والظلال هي ما يجعل الواجهة تبدو غالية — ليس
  اللون الأساسي" (uxplanet).

## B. Border Discipline (Linear)
- B1. كل حافة بطاقة: hairline 1px بلون متناسق مع سياق الإ elevate.
- B2. ألوان الحدود تتصاعد مع السلم: بالكاد مرئية على canvas، مرئية على card.
- B3. لا حدود زخرفية عشوائية (dashed/ألوان غريبة) خارج النظام.

## C. Typography (Vercel + Linear + RTL adaptation)
- C1. سقف الوزن 600 (semibold). **ممنوع 700/800**.
- C2. Sentence case — لا ALL-CAPS إلا labels تقنية صغيرة.
- C3. **RTL**: العربية ممنوع فيها letter-spacing سالب أو موجب (يكسر اتصال الحروف).
  التتبس السالب حصري على النص اللاتيني/الأرقام.
- C4. line-height: عربي body 1.6-1.75 (التشكيل والصعود/النزول)، عناوين 1.2-1.4.
- C5. سلم حجم موحد — لا أحجام خارج السلم.
- C6. mono حصرياً للأكواد والـ labels التقنية (أسماء الموديلات، الأوامر).
- C7. tabular-nums لكل الأرقام في بيانات/إحصاءات.

## D. Color Restraint (Vercel)
- D1. اللون الأساسي = علامات ترقيم: primary CTA واحد فقط لكل شاشة/سياق.
- D2. الألوان المشبعة فقط في اللحظات الدلالية (semantic) أو داخل الرسوم — أبداً على
  chrome زخرفي.
- D3. تدرج نص واضح: primary / secondary / tertiary بتباين صحيح (WCAG AA).
- D4. لا يُضاف لون accent جديد — النظام محدود.

## E. Spacing & Rhythm (Linear + Vercel)
- E1. كل قيم snap على سلم 4/8 — لا قيم يتيمة (7px, 15px, 26px).
- E2. فجوات كبيرة بين الأقسام + داخل ضيق للبطاقات — أبداً العكس.
- E3. padding البطاقات قانون واحد (الموجود: --mj-pad-card).

## F. Radius Discipline
- F1. snap على سلم radius — لا قيم يتيمة.
- F2. التداخل: inner radius = outer − padding.
- F3. لا خلط pill و square في نفس السياق.

## G. Motion & Micro-interactions (الـ"لمسات المفقودة")
- G1. كل عنصر تفاعلي له hover: 120-200ms ease، تغيّر خلفية/حد/رفع خفيف.
- G2. focus-visible ring موحد في كل النظام.
- G3. انتقالات على تغيّر الحالات — لا قفزات فورية.
- G4. prefers-reduced-motion مدعوم.
- G5. active/pressed states على الأزرار (scale 0.98 أو خلفية أغمق).

## H. States Coverage (SaaS polish)
- H1. loading: skeleton يطابق التخطيط النهائي (لا layout shift) — أبداً spinners في
  مكان بطاقات.
- H2. empty: يشرح + زر إجراء واحد واضح (no dead ends) — نمط موحد في كل الصفحات.
- H3. error: واضح وقابل للتصرف.
- H4. disabled: شكل صريح (opacity + منع hover).

## I. Iconography (Raycast doctrine)
- I1. نفس stroke width + نفس radius rules في كل مجموعة الأيقونات.
- I2. أحجام أيقونات متسقة لكل سياق (16/20/24).

## J. Craft Details (Linear)
- J1. selection color مخصص.
- J2. scrollbar منسق مع الثيم.
- J3. محاذاة بصرية (optical) لا رياضية فقط.
- J4. keycap affordance للاختصارات إن وجدت.
- J5. لا نص يتيم: كل عنصر تفاعلي cursor صحيح، كل صورة alt.

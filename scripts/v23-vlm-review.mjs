// v23 premium-eye VLM review — against MINSAJ-POLISH-STANDARDS (A–J)
// Usage: node scripts/v23-vlm-review.mjs <shot.png> [...]
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'node:fs';

const PROMPT = `أنت "عين Premium" — خبير صقل واجهات بمستوى Linear/Vercel، تراجع منتجاً عربياً RTL اسمه «مِنسَج» (منصة AI).

قيّم اللقطة حصراً عبر هذه العدسات (مستخلصة من معايير Linear/Vercel/Raycast):

1. **وزن الطباعة (الأهم):** هل تبدو النصوص العربية ثقيلة/زاعقة (Bold في كل مكان — أزرار، عناوين، ليبلات كلها سوداء سميكة)؟ المنتجات الفاخرة: body عادي، emphasis متوسط، العناوين فقط هي الثقيلة.
2. **هدوء الألوان:** هل الألوان المشبعة مستخدمة كـ"علامات ترقيم" أم تلوين زخرفي مفرط؟ هل هناك صراخ بصري؟
3. **الإيقاع:** مسافات متسقة؟ فجوات أقسام كبيرة وداخل البطاقات ضيق؟
4. **العمق:** حدود hairline رفيعة متناسقة؟ أم حدود سميكة/ظلال ثقيلة مبالغ فيها؟
5. **التناسق المكوني:** أزرار/رقاقات (chips) من نفس العائلة بنفس الارتفاع والانحناء؟
6. **التسلسل الهرمي:** أين تنظر أولاً؟ هل العنوان الأهم هو الأقوى أم يتنافس معه ضجيج؟
7. **الحرفية:** أي تفصيلة تكشف "توليد آلي" — عنصر يتيم غير محاذٍ، نص مقطوع، أيقونة حجمها غريب، حروف عربية متباعدة بشكل مكسور (letter-spacing يفصل الحروف المتصلة)؟

قواعد:
- لا تقترح إعادة تصميم — الصقل فقط.
- كل عيب: حدد موقعه الدقيق + لماذا يبدو غير فاخر.
- إن كان البُعد سليماً فقل "سليم" ولا تخترع.

الخرج: قائمة عيوب مرقمة، كل عيب بسطر واحد دقيق.`;

const zai = await ZAI.create();
for (const shot of process.argv.slice(2)) {
  const b64 = fs.readFileSync(shot).toString('base64');
  try {
    const res = await zai.chat.completions.create({
      messages: [
        { role: 'user', content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        ]},
      ],
      thinking: { type: 'disabled' },
    });
    console.log(`\n██████ ${shot.split('/').pop()} ██████`);
    console.log(res.choices[0]?.message?.content);
  } catch (e) {
    console.error(`${shot}: ${e.message}`);
  }
}

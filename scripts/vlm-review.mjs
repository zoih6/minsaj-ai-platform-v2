// Minsaj — Phase 22 visual-polish VLM review (DEG §13.5).
// Reviews screenshots against the §2 quality bar + the polish constitution:
// precision, alignment, spacing/size/typography consistency, component
// consistency, asset integrity, geometry, rhythm — NOT redesign ideas.
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/home/z/my-project/scripts/audit-tmp';
const SHOTS = process.argv.slice(2);

const PROMPT = `أنت مراجع صقل بصري خبير لواجهات منتجات رقمية عربية (RTL). هذه لقطة شاشة من «مِنسَج» — منصة ذكاء اصطناعي عربية.

مهمتك: تدقيق الصقل البصري فقط — وليس إعادة تصميم. ابحث حصريًا عن العيوب التالية:

1. المحاذاة: عناصر غير متمركزة رأسيًا، أيقونات غير محاذاة مع نصوصها، نصوص لا تبدأ من نفس المحور، أزرار غير متوافقة مع حقول مجاورة.
2. اتساق المسافات: مسافات متقاربة لكن غير متساوية بين عناصر مكافئة (مثل 15 مقابل 16px)، إيقاع عمودي مختل، padding غير متناسق بين بطاقات يفترض أنها متشابهة.
3. اتساق الأحجام: أزرار/حقول/شرائح (chips) يفترض أنها من نفس العائلة لكن بارتفاعات أو أنصاف أقطار مختلفة، أيقونات بأحجام متفاوتة بلا سبب.
4. الطباعة: أحجام خطوط غير متسقة لنفس المستوى الدلالي، نصوص صغيرة جدًا (تحت 11.5px)، تباعد أسطر غير متناسق، سطران لا يجلسان على نفس الـbaseline.
5. هندسة الحاويات: padding مكرر يتسبب في ضيق غير مبرر، حدود غير متوافقة، ظلال غير متناسقة، عناصر تلامس الحافة بشكل خاطئ.
6. سلامة الأصول: صور أو شعارات مشوهة/ممدودة، SVG بحجم داخلي خاطئ.
7. التسلسل الهرمي: عنصر يصرخ أكثر من اللازم أو إجراء أساسي غير واضح.
8. أي تجاوز أو تداخل أو قص نص غير مقصود.

قواعد صارمة:
- لا تقترح إعادة تصميم أو زخارف أو تدرجات جديدة.
- لا تذكر مشاكل عامة غامضة؛ حدد الموقع الدقيق لكل عيب (مثال: "الزر الثاني في شريط الأدوات أعلى بـ2px من الأول").
- إن كان كل شيء سليمًا في بُعد ما فلا تخترع مشاكل.

أخرج النتيجة بهذا الشكل بالضبط:
SCORE: <رقم من 10 لجودة الصقل>
DEFECTS:
- [P0|P1|P2] <وصف العيب + موقعه الدقيق>
أو "DEFECTS: none" إن لم توجد عيوب حقيقية.`;

async function main() {
  const zai = await ZAI.create();
  const results = {};
  for (const shot of SHOTS) {
    const file = path.join(DIR, shot);
    if (!fs.existsSync(file)) { console.error(`missing: ${shot}`); continue; }
    const b64 = fs.readFileSync(file).toString('base64');
    try {
      const r = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          ],
        }],
        thinking: { type: 'disabled' },
      });
      const content = r.choices[0]?.message?.content ?? 'NO RESPONSE';
      results[shot] = content;
      console.log(`\n########## ${shot} ##########\n${content}`);
    } catch (e) {
      console.error(`VLM error on ${shot}: ${e.message}`);
    }
  }
  fs.writeFileSync(path.join(DIR, 'vlm-review.json'), JSON.stringify(results, null, 2));
  console.log('\nSaved to vlm-review.json');
}

main().catch(e => { console.error(e); process.exit(1); });

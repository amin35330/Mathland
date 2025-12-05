import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (Lite Mode) ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // ۱. دریافت کلید API
    let apiKey = providedKey;
    if (!apiKey) {
      const db = getDbSafe();
      if (db) {
        try {
          const snap = await db.collection('settings').limit(1).get();
          if (!snap.empty) apiKey = snap.docs[0].data().apiKey;
        } catch (e) {}
      }
    }
    if (!apiKey) apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey || apiKey.trim() === "") {
      return res.status(400).json({ message: 'کلید API تنظیم نشده است.' });
    }

    // ۲. لیست مدل‌های "سبک" و "پایدار" (Lightweight & Stable)
    // این مدل‌ها برای کاربران رایگان همیشه باز هستند و بسیار سریع جواب می‌دهند
    const models = [
      "google/gemini-flash-1.5-8b",            // اولویت ۱: سریعترین مدل گوگل (مخصوص سرعت)
      "meta-llama/llama-3.2-3b-instruct:free", // اولویت ۲: مدل بسیار سبک و سریع متا
      "mistralai/mistral-7b-instruct:free",    // اولویت ۳: مدل قدیمی و پایدار میسترال
    ];

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    let successResponse = null;
    let lastError = null;

    // ۳. حلقه تلاش نوبتی (Sequential Retry)
    // از حالت موازی خارج کردیم تا فشار روی سرور رایگان کم شود و خطا ندهد
    for (const model of models) {
      try {
        console.log(`Trying Lite Model: ${model}...`);

        const messages: any[] = [];
        const systemPrompt = `
          شما معلم ریاضی مدرسه هستید.
          وظیفه: پاسخ کوتاه و سریع به سوالات ریاضی.
          قوانین: بدون توضیحات اضافه، بدون لاتک ($)، فقط حل مسئله.
        `;

        const userContent: any[] = [];
        const userText = prompt || (image ? "حل این مسئله" : "تست");
        userContent.push({ type: "text", text: userText });

        if (image) {
          let imageUrl = image;
          if (!image.startsWith('data:')) {
             imageUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`;
          }
          userContent.push({ type: "image_url", image_url: { url: imageUrl } });
        }

        messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: userContent });

        const apiResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://mathland.vercel.app',
            'X-Title': 'Riazi Land'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.3, // دمای پایین برای پاسخ‌های دقیق‌تر و سریع‌تر
            max_tokens: 1000, // محدودیت توکن برای جلوگیری از پاسخ‌های طولانی و کند
          })
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
           const msg = responseData?.error?.message || apiResponse.statusText;
           console.warn(`${model} failed: ${msg}`);
           lastError = msg;
           continue; // برو سراغ مدل بعدی
        }

        if (responseData.choices && responseData.choices.length > 0) {
          successResponse = responseData.choices[0].message.content;
          console.log(`SUCCESS with ${model}`);
          break; // موفقیت!
        }

      } catch (err: any) {
        console.warn(`Network error with ${model}:`, err.message);
        lastError = err.message;
      }
    }

    // ۴. نتیجه نهایی
    if (successResponse) {
      res.status(200).json({ answer: successResponse });
    } else {
      res.status(400).json({ 
        message: `سرورهای رایگان شلوغ هستند. لطفاً ۱ دقیقه دیگر تلاش کنید. (خطا: ${lastError})` 
      });
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};
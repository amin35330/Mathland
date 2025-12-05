import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (Parallel Mode) ---");
  
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
      return res.status(400).json({ message: 'کلید API یافت نشد.' });
    }

    // ۲. تفکیک مدل‌ها (تخصصی کردن)
    // مدل‌های بسیار سریع و رایگان برای تصویر
    const visionModels = [
      "google/gemini-flash-1.5-8b",       // فوق‌العاده سریع
      "google/gemini-2.0-flash-exp:free", // جدید و قوی
      "meta-llama/llama-3.2-11b-vision-instruct:free",
    ];

    // مدل‌های بسیار سریع برای متن
    const textModels = [
      "google/gemini-flash-1.5-8b",
      "google/gemini-2.0-flash-exp:free",
      "meta-llama/llama-3.1-8b-instruct:free",
    ];

    // انتخاب لیست مناسب
    const selectedModels = image ? visionModels : textModels;

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";

    // ۳. آماده‌سازی بدنه درخواست (مشترک برای همه)
    const messages: any[] = [];
    const systemPrompt = `
      شما "ریاضی‌یار" هستید.
      وظیفه: حل مسائل ریاضی به زبان فارسی.
      قوانین: پاسخ کوتاه، سریع، دقیق و بدون لاتک ($).
    `;

    const userContent: any[] = [];
    const userText = prompt || (image ? "حل این مسئله تصویر" : "تست");
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

    // ۴. تابع ارسال درخواست (برای استفاده در Promise)
    const fetchFromModel = async (model: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // تایم‌اوت ۱۵ ثانیه برای هر مدل

      try {
        console.log(`Racing: ${model}...`);
        const response = await fetch(API_URL, {
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
            temperature: 0.2, // دقت بالا
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`Status ${response.status}`);
        
        const data = await response.json();
        if (!data.choices || data.choices.length === 0) throw new Error("Empty response");
        
        return {
            answer: data.choices[0].message.content,
            model: model // برمی‌گردانیم تا بدانیم کدام برنده شد
        };

      } catch (err: any) {
        clearTimeout(timeoutId);
        throw new Error(`${model} failed: ${err.message}`);
      }
    };

    // ۵. اجرای موازی (Promise.any)
    // این دستور منتظر اولین موفقیت می‌ماند و بقیه را نادیده می‌گیرد
    try {
        const requests = selectedModels.map(model => fetchFromModel(model));
        const winner = await Promise.any(requests);
        
        console.log(`🏆 Winner Model: ${winner.model}`);
        res.status(200).json({ answer: winner.answer });

    } catch (aggregateError: any) {
        console.error("All models failed.");
        res.status(500).json({ 
            message: 'هیچ‌یک از سرورهای هوش مصنوعی پاسخ ندادند. لطفاً دوباره تلاش کنید.' 
        });
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};
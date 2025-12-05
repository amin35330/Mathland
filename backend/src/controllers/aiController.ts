import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (Provider: OpenRouter Multi-Model) ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // ۱. دریافت کلید API
    let apiKey = providedKey;

    if (!apiKey) {
      const db = getDbSafe();
      if (db) {
        try {
          const settingsSnapshot = await db.collection('settings').limit(1).get();
          if (!settingsSnapshot.empty) {
            apiKey = settingsSnapshot.docs[0].data().apiKey;
          }
        } catch (e) { console.error("DB Read Error Ignored"); }
      }
    }

    if (!apiKey) apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) apiKey = apiKey.trim();

    if (!apiKey) {
      return res.status(400).json({ 
        message: 'کلید API یافت نشد. لطفاً کلید OpenRouter را در پنل ادمین وارد کنید.' 
      });
    }

    // ۲. لیست مدل‌های قدرتمند و رایگان (به ترتیب اولویت)
    // این لیست تضمین می‌کند اگر یکی قطع بود، بعدی کار کند
    const models = [
      "google/gemini-2.0-flash-exp:free",      // جدیدترین مدل گوگل (بسیار سریع و قوی)
      "google/gemini-flash-1.5-8b:free",       // نسخه سبک گوگل
      "google/gemini-flash-1.5",               // نسخه استاندارد گوگل
      "meta-llama/llama-3.2-11b-vision-instruct:free", // مدل متا (که قبلا خطا داد)
      "nousresearch/hermes-3-llama-3.1-405b:free", // یک مدل بسیار قوی دیگر
    ];

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    let successResponse = null;
    let lastError = null;
    let usedModel = "";

    // ۳. حلقه تلاش (Retry Loop)
    for (const model of models) {
      try {
        // اگر عکس داریم و مدل فعلی متنی است، ردش کن (فعلا همه مدل‌های بالا ویژن دارند)
        console.log(`Trying Model: ${model}...`);

        const messages: any[] = [];
        const systemPrompt = `
          شما "ریاضی‌یار" هستید.
          وظیفه: حل مسائل ریاضی به زبان فارسی.
          قوانین: پاسخ تشریحی، ساده، بدون لاتک ($) و مرحله به مرحله باشد.
        `;

        const userContent: any[] = [];
        const userText = prompt || (image ? "این مسئله ریاضی در تصویر را حل کن." : "تست اتصال.");
        userContent.push({ type: "text", text: userText });

        if (image) {
          let imageUrl = image;
          if (!image.startsWith('data:')) {
             imageUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`;
          }
          userContent.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        }

        messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: userContent });

        // تنظیم هدرها بسیار مهم است
        const apiResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://mathland.vercel.app', // آدرس سایت شما
            'X-Title': 'Riazi Land'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.2,
            top_p: 1,
            repetition_penalty: 1,
          })
        });

        const responseData = await apiResponse.json();

        // اگر خطا داد (مثل 400 یا 503)، برو سراغ مدل بعدی
        if (!apiResponse.ok) {
           const msg = responseData?.error?.message || apiResponse.statusText;
           console.warn(`Model ${model} failed: ${msg}`);
           lastError = `${model}: ${msg}`;
           continue; 
        }

        // اگر پاسخ درست بود
        if (responseData.choices && responseData.choices.length > 0) {
          successResponse = responseData.choices[0].message.content;
          usedModel = model;
          console.log(`SUCCESS with ${model}`);
          break; // خروج از حلقه
        }

      } catch (err: any) {
        console.warn(`Network error with ${model}:`, err.message);
        lastError = err.message;
      }
    }

    // ۴. نتیجه نهایی
    if (successResponse) {
      res.status(200).json({ 
          answer: successResponse,
          debug_model: usedModel // برای اینکه بدانیم کدام مدل جواب داد
      });
    } else {
      console.error("All models failed.");
      res.status(400).json({ 
        message: `متاسفانه همه سرورهای هوش مصنوعی مشغول هستند. آخرین خطا: ${lastError}` 
      });
    }

  } catch (error: any) {
    console.error("--- SERVER FATAL ERROR ---", error);
    res.status(500).json({ 
      message: 'خطای داخلی سرور', 
      details: error.message 
    });
  }
};
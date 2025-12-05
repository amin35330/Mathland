import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (Provider: OpenRouter) ---");
  
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

    // پشتیبانی از متغیرهای محیطی مختلف
    if (!apiKey) apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) apiKey = apiKey.trim();

    if (!apiKey) {
      return res.status(400).json({ 
        message: 'کلید API یافت نشد. لطفاً کلید OpenRouter را در پنل ادمین وارد کنید.' 
      });
    }

    // ۲. لیست مدل‌های رایگان OpenRouter (به ترتیب اولویت)
    // این مدل‌ها هم متن و هم تصویر را پشتیبانی می‌کنند
    const models = [
      "google/gemini-2.0-flash-exp:free", // جدیدترین و سریعترین مدل گوگل (رایگان)
      "google/gemini-flash-1.5-8b:free",  // نسخه سبک گوگل
      "meta-llama/llama-3.2-11b-vision-instruct:free", // مدل متا (عالی برای تصویر)
    ];

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    let successResponse = null;
    let lastError = null;

    // ۳. حلقه تلاش هوشمند
    for (const model of models) {
      try {
        console.log(`Attempting with OpenRouter Model: ${model}`);

        const messages: any[] = [];
        const systemPrompt = `
          شما "ریاضی‌یار" هستید.
          وظیفه: حل مسائل ریاضی تا سطح پایه نهم (متوسطه اول) به زبان فارسی.
          قوانین:
          1. پاسخ باید کاملاً تشریحی و مرحله به مرحله باشد.
          2. از فرمت لاتک ($) استفاده نکنید.
          3. با لحنی ساده و آموزشی توضیح دهید.
        `;

        const userContent: any[] = [];
        const userText = prompt || (image ? "لطفاً این مسئله ریاضی در تصویر را حل کن." : "تست اتصال.");
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

        const apiResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://mathland.ir', // الزامی برای OpenRouter
            'X-Title': 'Riazi Land'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.2, // دقت بالا برای ریاضی
          })
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
           // اگر خطا داد، مدل بعدی را امتحان کن
           const msg = responseData?.error?.message || apiResponse.statusText;
           console.warn(`Model ${model} failed: ${msg}`);
           lastError = msg;
           continue; 
        }

        if (responseData.choices && responseData.choices.length > 0) {
          successResponse = responseData.choices[0].message.content;
          console.log(`Success with ${model}`);
          break; // موفقیت! خروج از حلقه
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
        message: `اتصال به هیچ‌یک از مدل‌ها برقرار نشد. آخرین خطا: ${lastError}` 
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
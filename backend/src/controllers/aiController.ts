import { Request, Response } from 'express';
import admin from 'firebase-admin';

// تابع کمکی برای دریافت دیتابیس
const getDb = () => admin.firestore();

export const solveProblem = async (req: Request, res: Response) => {
  try {
    const { prompt, image, mimeType } = req.body;

    // ۱. خواندن کلید API از متغیرهای محیطی سرور
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined on the server.");
      return res.status(500).json({ message: 'کلید API هوش مصنوعی روی سرور تنظیم نشده است.' });
    }

    // ۲. تعیین مدل بر اساس وجود عکس
    const model = image ? "gemini-pro-vision" : "gemini-pro";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // ۳. ساختاردهی بدنه درخواست برای گوگل
    const userParts = [];

    // فقط سوال کاربر یا عکس در این بخش قرار می‌گیرد
    userParts.push({ text: prompt || (image ? "این تصویر را تحلیل کن." : "سوال من را حل کن.") });

    if (image) {
      const cleanedBase64 = image.startsWith('data:') ? image.split(',')[1] : image;
      userParts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: cleanedBase64
        }
      });
    }

    // --- اصلاح نهایی و قطعی: ساختار صحیح درخواست ---
    const requestBody = {
      contents: [{ 
        role: "user",
        parts: userParts 
      }],
      // دستورالعمل سیستمی باید در این قسمت و با این ساختار باشد
      system_instruction: {
        parts: [
          {
            text: `شما یک معلم ریاضی به نام "ریاضی‌یار" هستید.
            ماموریت: حل مسائل ریاضی به زبان فارسی، به صورت مرحله به مرحله و بدون استفاده از فرمت لاتک ($).
            پاسخ نهایی را در خط آخر بنویسید.`
          }
        ]
      },
      generationConfig: {
        temperature: 0.2,
      }
    };

    // ۴. ارسال درخواست با fetch
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData = await apiResponse.json();

    // ۵. بررسی خطای احتمالی از طرف گوگل
    if (!apiResponse.ok || !responseData.candidates || responseData.candidates.length === 0) {
      console.error("Google API Error:", responseData);
      throw new Error(responseData?.error?.message || 'پاسخ نامعتبر از سرور گوگل دریافت شد.');
    }

    // ۶. استخراج و ارسال پاسخ
    const text = responseData.candidates[0].content.parts[0].text;
    res.status(200).json({ answer: text });

  } catch (error: any) {
    console.error("--- FATAL AI ERROR ---", error);
    res.status(500).json({ message: 'یک خطای پیش‌بینی نشده در سرور هوش مصنوعی رخ داد.', error: error.toString() });
  }
};
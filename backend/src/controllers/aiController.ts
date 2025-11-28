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
    const parts = [];

    // دستورالعمل سیستمی و سوال کاربر را با هم ترکیب می‌کنیم
    const fullPrompt = `
      شما یک معلم ریاضی به نام "ریاضی‌یار" هستید.
      ماموریت: حل مسائل ریاضی به زبان فارسی، به صورت مرحله به مرحله و بدون استفاده از فرمت لاتک ($).
      پاسخ نهایی را در خط آخر بنویسید.
      
      سوال کاربر: ${prompt || (image ? "این تصویر را تحلیل کن و مسئله ریاضی آن را حل کن." : "سوال من را حل کن.")}
    `;
    parts.push({ text: fullPrompt });

    if (image) {
      const cleanedBase64 = image.startsWith('data:') ? image.split(',')[1] : image;
      parts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: cleanedBase64
        }
      });
    }

    // --- اصلاح مهم: اضافه کردن "role": "user" ---
    const requestBody = {
      contents: [{ 
        role: "user", // این فیلد حیاتی بود که جا افتاده بود
        parts: parts 
      }],
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
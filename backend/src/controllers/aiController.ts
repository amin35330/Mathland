import { Request, Response } from 'express';
import admin from 'firebase-admin';

// تابع کمکی برای دریافت دیتابیس با مدیریت خطا
const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) {
      console.warn("Firebase app is not initialized yet.");
      return null;
    }
    return admin.firestore();
  } catch (e) {
    console.error("Error accessing Firestore:", e);
    return null;
  }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // ۱. اولویت اول: کلیدی که از سمت کاربر (پنل ادمین) آمده
    let apiKey = providedKey;

    // ۲. اولویت دوم: خواندن از دیتابیس (فقط اگر کلید نیامده بود)
    if (!apiKey) {
      const db = getDbSafe();
      if (db) {
        try {
          const settingsSnapshot = await db.collection('settings').limit(1).get();
          if (!settingsSnapshot.empty) {
            const settingsData = settingsSnapshot.docs[0].data();
            if (settingsData.apiKey) {
              apiKey = settingsData.apiKey;
            }
          }
        } catch (dbError) {
          console.error("DB Read Error (Ignored):", dbError);
          // اگر دیتابیس خطا داد، برنامه را متوقف نمی‌کنیم
        }
      } else {
        console.warn("Skipping DB check because Firebase is not connected.");
      }
    }

    // ۳. اولویت سوم: متغیر محیطی
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY;
    }

    // ۴. بررسی نهایی وجود کلید
    if (!apiKey) {
      console.error("No API Key found anywhere.");
      return res.status(400).json({ 
        message: 'کلید API یافت نشد. (ارتباط با دیتابیس هم برقرار نیست، لطفاً کلید را در پنل تست وارد کنید)' 
      });
    }

    console.log("Using API Key ending in:", apiKey.slice(-4));

    // ۵. تعیین مدل و آدرس
    // مدل flash سریع‌تر و ارزان‌تر است
    const model = image ? "gemini-1.5-flash" : "gemini-1.5-flash"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // ۶. آماده‌سازی درخواست برای گوگل
    const parts = [];
    const fullPrompt = `
      نقش: معلم ریاضی فارسی زبان.
      دستور: حل دقیق مسئله زیر بدون استفاده از لاتک ($).
      سوال: ${prompt || (image ? "تحلیل تصویر" : "تست اتصال")}
    `;
    parts.push({ text: fullPrompt });

    if (image) {
      const cleanedBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;
      parts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: cleanedBase64
        }
      });
    }

    // ۷. ارسال به گوگل
    console.log("Sending request to Google...");
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: parts }]
      })
    });

    const responseData = await apiResponse.json();

    // ۸. مدیریت خطای گوگل
    if (!apiResponse.ok) {
      console.error("Google API Error:", JSON.stringify(responseData));
      const msg = responseData?.error?.message || 'خطای ناشناخته از گوگل';
      return res.status(400).json({ message: `خطای گوگل: ${msg}` });
    }

    // ۹. ارسال پاسخ موفق
    if (responseData.candidates && responseData.candidates.length > 0) {
      const text = responseData.candidates[0].content.parts[0].text;
      res.status(200).json({ answer: text });
    } else {
      res.status(500).json({ message: 'پاسخ خالی از هوش مصنوعی دریافت شد.' });
    }

  } catch (error: any) {
    console.error("--- SERVER CRASH ---", error);
    // این قسمت مهم‌ترین بخش برای دیباگ شماست
    res.status(500).json({ 
      message: 'خطای داخلی سرور', 
      details: error.message,
      stack: error.stack 
    });
  }
};
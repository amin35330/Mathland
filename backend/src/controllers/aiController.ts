import { Request, Response } from 'express';
import admin from 'firebase-admin';

// تابع کمکی برای دریافت دیتابیس با مدیریت خطا
const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) {
      return null;
    }
    return admin.firestore();
  } catch (e) {
    return null;
  }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // ۱. دریافت کلید (اولویت با ورودی کاربر، سپس دیتابیس، سپس Env)
    let apiKey = providedKey;

    if (!apiKey) {
      const db = getDbSafe();
      if (db) {
        try {
          const settingsSnapshot = await db.collection('settings').limit(1).get();
          if (!settingsSnapshot.empty) {
            apiKey = settingsSnapshot.docs[0].data().apiKey;
          }
        } catch (dbError) {
          console.error("DB Read Error (Ignored)");
        }
      }
    }

    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
      return res.status(400).json({ 
        message: 'کلید API یافت نشد. لطفاً در پنل ادمین کلید را وارد کنید.' 
      });
    }

    // ۲. تعیین مدل (بخش اصلاح شده)
    // برای تست اتصال و متن‌های خالی، از gemini-pro استفاده می‌کنیم که پایدارترین است
    let model = "gemini-pro";
    
    // اگر عکس داشتیم، مجبوریم از مدل ویژن استفاده کنیم
    if (image) {
        // سعی می‌کنیم از مدل فلش استفاده کنیم، اگر خطا داد در لاگ مشخص می‌شود
        model = "gemini-1.5-flash-latest";
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // ۳. آماده‌سازی درخواست
    const parts = [];
    const fullPrompt = `
      نقش: معلم ریاضی.
      دستور: حل مسئله زیر به زبان فارسی و بدون استفاده از لاتک ($).
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

    // ۴. ارسال به گوگل
    console.log(`Sending request to Google Model: ${model}`);
    
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: parts }]
      })
    });

    const responseData = await apiResponse.json();

    // ۵. بررسی خطا
    if (!apiResponse.ok) {
      console.error("Google API Error:", JSON.stringify(responseData));
      const msg = responseData?.error?.message || 'خطای ناشناخته از گوگل';
      
      // اگر باز هم خطا داد، راهنمایی دقیق‌تر برمی‌گردانیم
      return res.status(400).json({ 
          message: `خطای گوگل (${model}): ${msg}` 
      });
    }

    // ۶. ارسال پاسخ
    if (responseData.candidates && responseData.candidates.length > 0) {
      const text = responseData.candidates[0].content.parts[0].text;
      res.status(200).json({ answer: text });
    } else {
      res.status(500).json({ message: 'پاسخ خالی دریافت شد.' });
    }

  } catch (error: any) {
    console.error("--- SERVER ERROR ---", error);
    res.status(500).json({ 
      message: 'خطای داخلی سرور', 
      details: error.message 
    });
  }
};
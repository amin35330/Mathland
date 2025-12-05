import { Request, Response } from 'express';
import admin from 'firebase-admin';

// تابع کمکی برای دریافت دیتابیس
const getDb = () => admin.firestore();

export const solveProblem = async (req: Request, res: Response) => {
  try {
    // ۱. استخراج اطلاعات از بدنه درخواست
    // نکته: providedKey همان کلیدی است که از فرانت‌اند (پنل ادمین) می‌آید
    const { prompt, image, mimeType, providedKey } = req.body;

    let apiKey = providedKey;

    // ۲. اگر کلید از فرانت نیامده بود، سعی کن از دیتابیس بخوانی
    if (!apiKey) {
        try {
            const settingsSnapshot = await getDb().collection('settings').limit(1).get();
            if (!settingsSnapshot.empty) {
                const settingsData = settingsSnapshot.docs[0].data();
                if (settingsData.apiKey) {
                    apiKey = settingsData.apiKey;
                }
            }
        } catch (dbError) {
            console.error("Error fetching API key from DB:", dbError);
        }
    }

    // ۳. اگر هنوز کلید نداریم، از متغیر محیطی سرور استفاده کن (حالت اضطراری)
    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY;
    }

    // ۴. بررسی نهایی: اگر هیچ کلیدی پیدا نشد، خطا بده
    if (!apiKey) {
      console.error("API Key is missing in Request, DB, and Env.");
      return res.status(400).json({ 
          message: 'کلید API یافت نشد. لطفاً در پنل ادمین > تنظیمات، کلید را وارد و ذخیره کنید.' 
      });
    }

    // ۵. تعیین مدل بر اساس وجود عکس
    const model = image ? "gemini-1.5-flash" : "gemini-pro"; 
    // نکته: مدل gemini-1.5-flash سریع‌تر و جدیدتر است، اما اگر خطا داد به gemini-pro برگردید
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // ۶. ساختاردهی بدنه درخواست برای گوگل
    const parts = [];

    const fullPrompt = `
      شما یک معلم ریاضی دلسوز و حرفه‌ای به نام "ریاضی‌یار" هستید.
      ماموریت: حل مسائل ریاضی به زبان فارسی، کاملاً تشریحی و مرحله به مرحله.
      قوانین:
      1. از فرمت لاتک ($) استفاده نکنید، فرمول‌ها را ساده بنویسید.
      2. لحن شما باید آموزشی و تشویق‌کننده باشد.
      3. پاسخ نهایی را در انتها مشخص کنید.
      
      سوال کاربر: ${prompt || (image ? "این تصویر را تحلیل کن و مسئله ریاضی آن را حل کن." : "سوال من را حل کن.")}
    `;
    parts.push({ text: fullPrompt });

    if (image) {
      // تمیزکاری فرمت Base64 (حذف هدر data:image/...)
      const cleanedBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;
      
      parts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: cleanedBase64
        }
      });
    }

    const requestBody = {
      contents: [{ 
        role: "user",
        parts: parts 
      }],
    };

    // ۷. ارسال درخواست به گوگل
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData = await apiResponse.json();

    // ۸. بررسی خطای بازگشتی از گوگل
    if (!apiResponse.ok) {
      console.error("Google API Error Details:", JSON.stringify(responseData, null, 2));
      const errorMessage = responseData?.error?.message || 'خطا در دریافت پاسخ از گوگل.';
      
      // اگر خطا مربوط به نامعتبر بودن کلید بود، شفاف بگو
      if (errorMessage.includes('API key not valid')) {
          return res.status(403).json({ message: 'کلید API وارد شده نامعتبر است.' });
      }

      throw new Error(`Google Error: ${errorMessage}`);
    }

    // ۹. استخراج پاسخ نهایی
    if (responseData.candidates && responseData.candidates.length > 0) {
        const text = responseData.candidates[0].content.parts[0].text;
        res.status(200).json({ answer: text });
    } else {
        throw new Error('پاسخی از سمت هوش مصنوعی دریافت نشد (Candidates empty).');
    }

  } catch (error: any) {
    console.error("--- FATAL AI ERROR ---", error);
    // ارسال متن دقیق خطا به فرانت برای دیباگ بهتر
    res.status(500).json({ 
        message: 'خطای سرور در پردازش درخواست هوش مصنوعی.', 
        error: error.message || error.toString() 
    });
  }
};
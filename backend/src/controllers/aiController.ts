import { Request, Response } from 'express';
import admin from 'firebase-admin';

// تابع کمکی برای دریافت دیتابیس با مدیریت خطا
const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (Multi-Model Mode) ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // ۱. دریافت و تمیزسازی کلید API
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

    if (!apiKey) apiKey = process.env.GEMINI_API_KEY;

    // حذف فاصله‌های اضافی احتمالی از کلید
    if (apiKey) apiKey = apiKey.trim();

    if (!apiKey) {
      return res.status(400).json({ 
        message: 'کلید API یافت نشد. لطفاً در پنل ادمین کلید را وارد کنید.' 
      });
    }

    // ۲. لیست مدل‌هایی که به ترتیب تست می‌شوند
    // اگر عکس باشد، فقط مدل‌های ویژن‌دار تست می‌شوند
    const textModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
    const visionModels = ["gemini-1.5-flash", "gemini-1.5-pro"];
    
    const modelsToTry = image ? visionModels : textModels;
    
    let lastError = null;
    let successResponse = null;

    // ۳. حلقه تلاش برای مدل‌ها
    for (const model of modelsToTry) {
        try {
            console.log(`Attempting with model: ${model}...`);
            
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

            const apiResponse = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: "user", parts: parts }]
              })
            });

            const responseData = await apiResponse.json();

            // اگر پاسخ موفق بود، ذخیره کن و از حلقه خارج شو
            if (apiResponse.ok && responseData.candidates && responseData.candidates.length > 0) {
                successResponse = responseData.candidates[0].content.parts[0].text;
                console.log(`Success with model: ${model}`);
                break; 
            } else {
                // اگر خطا داد، لاگ کن و برو سراغ مدل بعدی
                const msg = responseData?.error?.message || apiResponse.statusText;
                console.warn(`Failed with ${model}: ${msg}`);
                lastError = msg;
            }

        } catch (error: any) {
            console.warn(`Network error with ${model}: ${error.message}`);
            lastError = error.message;
        }
    }

    // ۴. نتیجه نهایی
    if (successResponse) {
        return res.status(200).json({ answer: successResponse });
    } else {
        // اگر همه مدل‌ها شکست خوردند
        console.error("All models failed.");
        return res.status(400).json({ 
            message: `اتصال برقرار نشد. آخرین خطا: ${lastError}` 
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
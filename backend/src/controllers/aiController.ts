import { Request, Response } from 'express';
import admin from 'firebase-admin';

// تابع کمکی دیتابیس
const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (Auto-Fallback Mode) ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // ۱. تلاش برای پیدا کردن کلید گوگل (اختیاری)
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
    if (!apiKey) apiKey = process.env.GEMINI_API_KEY; // یا هر کلید دیگری

    // متغیر برای ذخیره پاسخ نهایی
    let finalAnswer = null;
    let usedSource = "";

    // ---------------------------------------------------------
    // روش اول: استفاده از گوگل (اگر کلید موجود باشد)
    // ---------------------------------------------------------
    if (apiKey && apiKey.startsWith('AIza')) {
        try {
            console.log("Attempting Google Gemini...");
            const model = "gemini-1.5-flash"; // مدل سریع و پایدار گوگل
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const parts = [];
            parts.push({ text: `تو یک معلم ریاضی هستی. سوال زیر را به فارسی و ساده حل کن:\n${prompt || "تست"}` });
            
            if (image) {
                const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;
                parts.push({ inline_data: { mime_type: mimeType || 'image/jpeg', data: cleanBase64 } });
            }

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }] })
            });

            const data = await resp.json();
            if (resp.ok && data.candidates && data.candidates.length > 0) {
                finalAnswer = data.candidates[0].content.parts[0].text;
                usedSource = "Google Gemini";
            } else {
                console.warn("Google failed, switching to backup...");
            }
        } catch (e) {
            console.warn("Google connection error, switching to backup...");
        }
    }

    // ---------------------------------------------------------
    // روش دوم: استفاده از Pollinations (بدون نیاز به کلید!)
    // این روش نجات‌دهنده است وقتی همه چیز خراب می‌شود
    // ---------------------------------------------------------
    if (!finalAnswer) {
        try {
            console.log("Attempting Pollinations (Keyless Backup)...");
            
            // آماده‌سازی متن
            const systemMsg = "You are a helpful Persian math teacher. Solve the math problem simply and step-by-step in Persian language. Do not use LaTeX.";
            const userMsg = prompt || "یک مسئله ریاضی ساده حل کن";
            
            // Pollinations فقط متن قبول می‌کند (تصویر را فعلا نادیده می‌گیریم تا لااقل متن کار کند)
            const fullText = `${systemMsg}\n\nQuestion: ${userMsg}`;
            
            // ارسال درخواست به سرور عمومی Pollinations
            const resp = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemMsg },
                        { role: 'user', content: userMsg }
                    ],
                    model: 'openai', // استفاده از مدل رایگان OpenAI
                    seed: Math.floor(Math.random() * 1000)
                })
            });

            if (resp.ok) {
                finalAnswer = await resp.text(); // پاسخ به صورت متن خام می‌آید
                usedSource = "Pollinations (Free)";
            }
        } catch (e) {
            console.error("Pollinations failed:", e);
        }
    }

    // ---------------------------------------------------------
    // ارسال پاسخ نهایی
    // ---------------------------------------------------------
    if (finalAnswer) {
        console.log(`Success using: ${usedSource}`);
        res.status(200).json({ answer: finalAnswer });
    } else {
        res.status(500).json({ 
            message: 'متاسفانه تمام سرویس‌ها (حتی سرویس بدون کلید) در حال حاضر پاسخگو نیستند. لطفاً دقایقی دیگر تلاش کنید.' 
        });
    }

  } catch (error: any) {
    console.error("Server Fatal Error:", error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};
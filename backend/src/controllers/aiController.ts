import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

export const solveProblem = async (req: Request, res: Response) => {
  try {
    const { prompt, image, mimeType } = req.body;

    // خواندن کلید API از متغیرهای محیطی سرور
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'کلید API هوش مصنوعی روی سرور تنظیم نشده است.' });
    }

    const model = image ? "gemini-pro-vision" : "gemini-pro";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: any[] = [];

    const systemInstruction = `
      شما "ریاضی‌یار" هستید.
      ماموریت: حل مسائل ریاضی به زبان فارسی، بدون استفاده از فرمت لاتک ($).
      پاسخ نهایی را در خط آخر بنویسید.
    `;

    parts.push({ text: systemInstruction });
    parts.push({ text: `\n\nسوال کاربر: ${prompt || (image ? "این تصویر را تحلیل کن." : "سوال من را حل کن.")}` });

    if (image) {
      const cleanedBase64 = image.startsWith('data:') ? image.split(',')[1] : image;
      parts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: cleanedBase64
        }
      });
    }

    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
      }
    };

    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("Google API Error:", errorData);
      throw new Error(errorData.error.message || 'خطا در ارتباط با سرور گوگل');
    }

    const responseData = await apiResponse.json();
    const text = responseData.candidates[0].content.parts[0].text;

    res.status(200).json({ answer: text });

  } catch (error: any) {
    console.error("--- FATAL AI ERROR ---", error);
    res.status(500).json({ message: 'یک خطای پیش‌بینی نشده در سرور هوش مصنوعی رخ داد.', error: error.toString() });
  }
};
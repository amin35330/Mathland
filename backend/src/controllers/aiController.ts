import { Request, Response } from 'express';
// @ts-ignore
import { GoogleGenerativeAI } from "@google/generative-ai";

export const solveProblem = async (req: Request, res: Response) => {
  try {
    const { prompt, image, mimeType } = req.body;

    // --- اصلاح مهم: خواندن کلید API مستقیم از متغیرهای سرور ---
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined on the server.");
      return res.status(500).json({ message: 'کلید API هوش مصنوعی روی سرور تنظیم نشده است.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const parts: any[] = [];

    if (image) {
      const cleanedBase64 = image.startsWith('data:') ? image.split(',')[1] : image;
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanedBase64
        }
      });
    }

    const fullPrompt = `
      شما "ریاضی‌یار" هستید.
      ماموریت: حل مسائل ریاضی به زبان فارسی، بدون استفاده از فرمت لاتک ($).
      پاسخ نهایی را در خط آخر بنویسید.
      
      سوال کاربر: ${prompt || (image ? "این تصویر را تحلیل کن و مسئله ریاضی آن را حل کن." : "سوال ریاضی من را حل کن.")}
    `;
    
    parts.push({ text: fullPrompt });

    const result = await model.generateContent({
        contents: [{ role: "user", parts }]
    });

    const response = result.response;
    const text = response.text();

    res.status(200).json({ answer: text });

  } catch (error: any) {
    console.error("--- FATAL AI ERROR ---", error);
    
    if (error.message && error.message.includes('429')) {
       return res.status(429).json({ 
         message: "سرور هوش مصنوعی شلوغ است. لطفاً یک دقیقه دیگر تلاش کنید." 
       });
    }

    res.status(500).json({ message: 'یک خطای پیش‌بینی نشده در سرور هوش مصنوعی رخ داد.', error: error.toString() });
  }
};
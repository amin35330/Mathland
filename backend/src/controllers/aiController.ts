import { Request, Response } from 'express';
// @ts-ignore
import { GoogleGenAI } from "@google/genai";
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

export const solveProblem = async (req: Request, res: Response) => {
  try {
    const { prompt, image, mimeType } = req.body;

    const snapshot = await getDb().collection('settings').limit(1).get();
    
    if (snapshot.empty) {
        return res.status(500).json({ message: 'تنظیمات سایت در دیتابیس پیدا نشد.' });
    }
    
    const settings = snapshot.docs[0].data();
    if (!settings || !settings.apiKey) {
      return res.status(400).json({ message: 'کلید API در پنل مدیریت تنظیم نشده است.' });
    }

    const ai = new GoogleGenAI({ apiKey: settings.apiKey });
    
    // --- اصلاح نهایی: استفاده از نام کامل و استاندارد مدل ---
    const modelId = 'gemini-1.0-pro'; 

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

    const defaultPrompt = image 
      ? "این تصویر را تحلیل کن و مسئله ریاضی آن را حل کن." 
      : "سوال ریاضی من را حل کن.";

    parts.push({
      text: prompt ? prompt : defaultPrompt
    });

    const systemInstruction = `
      شما "ریاضی‌یار" هستید.
      ماموریت: حل مسائل ریاضی به زبان فارسی، بدون استفاده از فرمت لاتک ($).
      پاسخ نهایی را در خط آخر بنویسید.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts } as any,
      config: {
        temperature: 0.2,
        systemInstruction: systemInstruction,
      }
    });

    let text = "متاسفانه پاسخی دریافت نشد. لطفاً دوباره تلاش کنید.";
    
    if (response) {
       // @ts-ignore
       if (typeof response.text === 'function') {
           // @ts-ignore
           text = response.text();
       } else if ((response as any).text) {
           text = (response as any).text;
       } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
           text = response.candidates[0].content.parts[0].text;
       }
    }

    res.status(200).json({ answer: text });

  } catch (error: any) {
    console.error("--- FATAL AI ERROR ---");
    console.error("FULL AI ERROR OBJECT:", error);
    
    if (error.message && error.message.includes('429')) {
       return res.status(429).json({ 
         message: "سرور هوش مصنوعی شلوغ است. لطفاً یک دقیقه دیگر تلاش کنید." 
       });
    }

    res.status(500).json({ message: 'یک خطای پیش‌بینی نشده در سرور هوش مصنوعی رخ داد.', error: error.toString() });
  }
};
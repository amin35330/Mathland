import { Request, Response } from 'express';
// @ts-ignore
import { GoogleGenAI } from "@google/genai";
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

export const solveProblem = async (req: Request, res: Response) => {
  try {
    console.log("AI solve endpoint hit. Processing request...");
    const { prompt, image, mimeType } = req.body;

    // مرحله ۱: دریافت کلید API از دیتابیس
    const snapshot = await getDb().collection('settings').limit(1).get();
    
    if (snapshot.empty) {
        console.error("Settings document not found in Firestore.");
        return res.status(500).json({ message: 'تنظیمات سایت در دیتابیس پیدا نشد.' });
    }
    
    const settings = snapshot.docs[0].data();
    if (!settings || !settings.apiKey) {
      console.error("API Key is missing in the settings document.");
      return res.status(400).json({ message: 'کلید API در پنل مدیریت تنظیم نشده است.' });
    }
    console.log("API Key successfully retrieved from settings.");

    // مرحله ۲: آماده‌سازی درخواست برای گوگل
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });
    const modelId = 'gemini-1.5-flash'; 

    const parts: any[] = [];

    if (image) {
      const cleanedBase64 = image.startsWith('data:') ? image.split(',')[1] : image;
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanedBase64
        }
      });
      console.log("Image part added to the request.");
    }

    const defaultPrompt = image 
      ? "این تصویر را تحلیل کن و مسئله ریاضی آن را حل کن." 
      : "سوال ریاضی من را حل کن.";

    parts.push({
      text: prompt ? prompt : defaultPrompt
    });
    console.log("Text prompt added to the request.");

    const systemInstruction = `
      شما "ریاضی‌یار" هستید.
      ماموریت: حل مسائل ریاضی به زبان فارسی، بدون استفاده از فرمت لاتک ($).
      پاسخ نهایی را در خط آخر بنویسید.
    `;

    // مرحله ۳: ارسال درخواست به گوگل
    console.log("Sending request to Google GenAI...");
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts } as any,
      config: {
        temperature: 0.2,
        systemInstruction: systemInstruction,
      }
    });
    console.log("Received response from Google GenAI.");

    // مرحله ۴: پردازش پاسخ
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
    console.log("Response processed successfully. Sending back to client.");

    res.status(200).json({ answer: text });

  } catch (error: any) {
    // مرحله ۵: مدیریت خطای جامع
    console.error("--- FATAL AI ERROR ---");
    console.error("FULL AI ERROR OBJECT:", error); // این خط مهم‌ترین بخش برای دیباگ است
    
    if (error.message && error.message.includes('429')) {
       return res.status(429).json({ 
         message: "سرور هوش مصنوعی شلوغ است. لطفاً یک دقیقه دیگر تلاش کنید." 
       });
    }

    res.status(500).json({ message: 'یک خطای پیش‌بینی نشده در سرور هوش مصنوعی رخ داد.', error: error.toString() });
  }
};
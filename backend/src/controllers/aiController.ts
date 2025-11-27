import { Request, Response } from 'express';
// @ts-ignore
import { GoogleGenAI } from "@google/genai";
import { Settings } from '../models/allModels';

export const solveProblem = async (req: Request, res: Response) => {
  try {
    const { prompt, image, mimeType } = req.body;

    const settings = await Settings.findOne();
    if (!settings || !settings.apiKey) {
      return res.status(400).json({ message: 'کلید API تنظیم نشده است.' });
    }

    const ai = new GoogleGenAI({ apiKey: settings.apiKey });
    // استفاده از مدل سریعتر برای جلوگیری از Timeout ورسل
    const modelId = 'gemini-1.5-flash'; 

    const parts: any[] = [];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image
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

    let text = "پاسخی دریافت نشد.";
    
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

    res.json({ answer: text });

  } catch (error: any) {
    console.error("AI Error:", error);
    
    // مدیریت خطای محدودیت گوگل (429)
    if (error.message && error.message.includes('429')) {
       return res.json({ 
         answer: "سرور هوش مصنوعی شلوغ است (Too Many Requests). لطفاً یک دقیقه صبر کنید و دوباره امتحان کنید." 
       });
    }

    res.status(500).json({ message: 'خطا در هوش مصنوعی', error: error.message });
  }
};
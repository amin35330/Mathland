
import { GoogleGenAI } from "@google/genai";

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use gemini-2.0-flash for a quick connectivity test
    await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: 'Test connection' }] } as any,
    });
    return true;
  } catch (error) {
    console.error("API Key Validation Error:", error);
    return false;
  }
};

export const solveMathProblem = async (
  promptText: string,
  imageBase64: string | undefined,
  imageMimeType: string = 'image/jpeg',
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("کلید API هوش مصنوعی تنظیم نشده است. لطفاً از پنل مدیریت، کلید API را وارد کنید.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Using gemini-3-pro-preview as requested for "unlimited" feel and best reasoning capabilities
    const modelId = 'gemini-3-pro-preview';
    
    const parts: any[] = [];
    
    // Add image part if exists
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64
        }
      });
    }

    // Add text prompt
    const defaultPrompt = imageBase64 
      ? "این تصویر را تحلیل کن و مسئله ریاضی آن را حل کن." 
      : "سوال ریاضی من را حل کن.";

    parts.push({
      text: promptText ? promptText : defaultPrompt
    });

    const systemInstruction = `
      شما "ریاضی‌یار" هستید.
      
      ماموریت: حل مسائل ریاضی، فیزیک و هندسه به صورت کوتاه، کاربردی و بدون حاشیه.
      
      قوانین پاسخ‌دهی:
      ۱. **حذف زوائد:** بدون مقدمه‌چینی (مثل "سلام..." یا "بیایید بررسی کنیم") و توضیحات اضافه، مستقیماً سراغ حل مسئله بروید.
      ۲. **ممنوعیت لاتک ($):** به هیچ وجه از علامت $ یا فرمت‌بندی LaTeX استفاده نکنید. تمام فرمول‌ها و اعداد را به صورت متن ساده و خوانا بنویسید.
      ۳. **ساختار پاسخ:**
         - ابتدا فرمول یا روش حل را کوتاه بنویسید.
         - سپس جایگذاری اعداد را نشان دهید.
         - در نهایت پاسخ نهایی را در خط آخر اعلام کنید.
      ۴. **کوتاه و مفید:** توضیحات متنی باید حداقل و فقط در حد ضرورت برای فهمیدن راه‌حل باشد.
      
      اگر سوال غیردرسی بود، فقط بگویید "فقط سوالات درسی را پاسخ می‌دهم".
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts
      } as any, 
      config: {
        temperature: 0.2,
        systemInstruction: systemInstruction,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      }
    });

    if (response && response.text) {
      return response.text;
    } 
    
    // Fallback logic
    if (response && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts.map((p: any) => p.text).join('');
        if (text) return text;
      }
      const reason = candidate.finishReason;
      if (reason && reason !== 'STOP') {
         return `مدل پاسخ‌دهی را متوقف کرد (دلیل: ${reason}).`;
      }
    }

    return "متاسفانه پاسخی دریافت نشد. لطفا مجددا تلاش کنید.";

  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    if (error.message?.includes('API_KEY')) {
       throw new Error("کلید API نامعتبر است. لطفا تنظیمات را بررسی کنید.");
    }
    throw new Error("مشکلی در ارتباط با سرور هوش مصنوعی پیش آمد.");
  }
};

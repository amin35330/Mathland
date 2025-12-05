import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (OCR + Solve Mode) ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // ۱. دریافت کلید API
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
    if (!apiKey) apiKey = process.env.OPENROUTER_API_KEY;
    
    // ۲. آماده‌سازی پرامپت هوشمند (تغییر اصلی اینجاست)
    // به هوش مصنوعی دستور می‌دهیم اول نقش OCR (مبدل عکس به متن) را بازی کند
    const systemPrompt = `
      شما "ریاضی‌یار" هستید.
      وظیفه شما دو مرحله دارد:
      ۱. اگر تصویری دریافت کردید، ابتدا متن فارسی یا فرمول‌های داخل تصویر را دقیق بخوانید و بنویسید: "متن سوال: [متن]"
      ۲. سپس مسئله را به زبان فارسی، ساده، مرحله به مرحله و بدون استفاده از لاتک ($) حل کنید.
      
      نکته: اگر تصویر ناخوانا بود، بگویید "تصویر واضح نیست".
    `;

    // ۳. لیست مدل‌های هوش مصنوعی (همان لیست پایدار قبلی)
    const models = [
      "google/gemini-2.0-flash-exp:free",      
      "google/gemini-flash-1.5-8b:free",       
      "meta-llama/llama-3.2-11b-vision-instruct:free", 
      "google/gemini-flash-1.5",               
    ];

    // اگر کلید نبود، مستقیم برو سراغ سرویس رایگان Pollinations
    if (!apiKey || apiKey.trim() === "") {
        console.warn("No API Key, switching to Pollinations directly.");
        return await usePollinationsFallback(res, prompt, systemPrompt);
    }

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    let successResponse = null;
    let lastError = null;

    // ۴. حلقه تلاش هوشمند
    for (const model of models) {
      try {
        console.log(`Trying Model: ${model}...`);

        const messages: any[] = [];
        const userContent: any[] = [];
        
        // متن ارسالی کاربر
        const userText = prompt || (image ? "لطفاً متن این تصویر را بخوان و مسئله را حل کن." : "تست");
        userContent.push({ type: "text", text: userText });

        if (image) {
          let imageUrl = image;
          if (!image.startsWith('data:')) {
             imageUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`;
          }
          userContent.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        }

        messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: userContent });

        const apiResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://mathland.vercel.app',
            'X-Title': 'Riazi Land'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.2, // دقت بالا
          })
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
           const msg = responseData?.error?.message || apiResponse.statusText;
           console.warn(`Model ${model} failed: ${msg}`);
           lastError = msg;
           continue; 
        }

        if (responseData.choices && responseData.choices.length > 0) {
          successResponse = responseData.choices[0].message.content;
          console.log(`SUCCESS with ${model}`);
          break; 
        }

      } catch (err: any) {
        lastError = err.message;
      }
    }

    // ۵. نتیجه نهایی
    if (successResponse) {
      res.status(200).json({ answer: successResponse });
    } else {
      // اگر همه مدل‌های OpenRouter شکست خوردند، برو سراغ Pollinations
      await usePollinationsFallback(res, prompt, systemPrompt);
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};

// تابع کمکی برای سرویس بدون کلید (Pollinations)
// این تابع وقتی صدا زده می‌شود که کلید نباشد یا OpenRouter کار نکند
async function usePollinationsFallback(res: Response, prompt: string, systemPrompt: string) {
    try {
        console.log("Using Pollinations Fallback...");
        const resp = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt || "یک سوال ریاضی حل کن" }
                ],
                model: 'openai',
                seed: Math.floor(Math.random() * 1000)
            })
        });

        if (resp.ok) {
            const text = await resp.text();
            return res.status(200).json({ answer: text });
        } else {
            throw new Error("Pollinations failed");
        }
    } catch (e) {
        return res.status(500).json({ 
            message: 'متاسفانه سرویس پاسخگو نیست. لطفاً دقایقی دیگر تلاش کنید.' 
        });
    }
}
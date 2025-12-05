import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const solveProblem = async (req: Request, res: Response) => {
  console.log("--- AI Request Started (Vision Fix) ---");
  
  try {
    const { prompt, image, mimeType, providedKey } = req.body;

    // لاگ کردن وضعیت دریافت عکس
    if (image) {
        console.log(`Image received. Size: ${image.length} chars. Mime: ${mimeType}`);
    } else {
        console.log("No image received.");
    }

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
    
    // اگر کلید نبود، مستقیم به فال‌بک برو
    if (!apiKey || apiKey.trim() === "") {
        return await usePollinationsFallback(res, prompt, image);
    }

    // ۲. مدل‌های قدرتمند دارای بینایی (Vision)
    // مدل gemini-2.0-flash-exp بهترین عملکرد را روی عکس دارد
    const models = [
      "google/gemini-2.0-flash-exp:free",      
      "meta-llama/llama-3.2-11b-vision-instruct:free", 
      "google/gemini-flash-1.5-8b:free",       
    ];

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    let successResponse = null;
    let lastError = null;

    // ۳. تلاش برای ارسال به OpenRouter
    for (const model of models) {
      try {
        console.log(`Trying Model: ${model}...`);

        const messages: any[] = [];
        
        // پرامپت سیستمی بسیار دقیق برای خواندن عکس
        const systemPrompt = `
          شما "ریاضی‌یار" هستید.
          ماموریت:
          ۱. اگر تصویری وجود دارد، تمام تلاش خود را بکن تا اعداد و متن فارسی داخل آن را بخوانی.
          ۲. اگر تصویر فرمول ریاضی است (مثل 2*2)، آن را حل کن.
          ۳. پاسخ نهایی باید فارسی، ساده و بدون لاتک ($) باشد.
          ۴. اگر تصویر را ندیدی یا ناخوانا بود، بگو: "تصویر برایم بارگذاری نشد، لطفاً متن سوال را بنویسید."
        `;

        const userContent: any[] = [];
        const userText = prompt || (image ? "لطفاً این تصویر را با دقت بخوان و مسئله ریاضی آن را حل کن." : "سلام");
        
        userContent.push({ type: "text", text: userText });

        if (image) {
          // اصلاح فرمت عکس برای اطمینان از ارسال صحیح
          let imageUrl = image;
          // اگر هدر دیتا نداشت، اضافه کن
          if (!image.startsWith('data:')) {
             imageUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`;
          }
          
          userContent.push({
            type: "image_url",
            image_url: { 
                url: imageUrl,
                detail: "auto" // به هوش مصنوعی اجازه می‌دهد کیفیت را تشخیص دهد
            }
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
            temperature: 0.1, // دمای پایین برای دقت ریاضی
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

    // ۴. نتیجه نهایی
    if (successResponse) {
      res.status(200).json({ answer: successResponse });
    } else {
      // اگر همه مدل‌های اصلی شکست خوردند، برو سراغ سیستم کمکی
      console.warn("All OpenRouter models failed. Switching to Fallback.");
      await usePollinationsFallback(res, prompt, image);
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};

// تابع کمکی (Fallback)
async function usePollinationsFallback(res: Response, prompt: string, image: any) {
    // اگر عکس داشتیم ولی مجبور شدیم بیایم اینجا (چون سرویس اصلی قطع بود)
    // باید صادقانه به کاربر بگوییم که سیستم بینایی قطع است
    if (image) {
        return res.status(200).json({ 
            answer: "⚠️ متاسفانه سرورهای پردازش تصویر در حال حاضر شلوغ هستند و قادر به دیدن عکس نیستم.\n\nلطفاً **متن سوال** را تایپ کنید تا فوراً پاسخ دهم." 
        });
    }

    try {
        console.log("Using Pollinations Text Fallback...");
        const resp = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: "You are a Persian math teacher. Solve simply." },
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
            message: 'متاسفانه تمام سرویس‌ها در حال حاضر پاسخگو نیستند.' 
        });
    }
}
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// این تابع یک درخواست تستی ساده می‌فرستد تا ببیند آیا ارتباط برقرار می‌شود یا خیر
export const validateApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  try {
    // ما از همان اندپوینت حل مسئله استفاده می‌کنیم اما با یک سوال ساده
    // نکته: در حال حاضر بک‌اند کلید را از دیتابیس یا Env می‌خواند، بنابراین این تست
    // بیشتر تست اتصال به سرور است تا تست خود کلید ورودی (مگر اینکه بک‌اند را بعداً اصلاح کنیم)
    const result = await solveMathProblem("2+2", undefined, undefined, apiKey);
    if (result) {
      return { success: true, message: 'اتصال با موفقیت برقرار شد و پاسخ دریافت گردید.' };
    }
    return { success: false, message: 'پاسخی دریافت نشد.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'خطا در برقراری ارتباط' };
  }
};

export const solveMathProblem = async (
  promptText: string,
  imageBase64: string | undefined,
  imageMimeType: string = 'image/jpeg',
  apiKey: string
): Promise<string> => {

  try {
    console.log("Sending request to:", `${API_URL}/ai/solve`);
    
    const response = await fetch(`${API_URL}/ai/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: promptText,
        image: imageBase64,
        mimeType: imageMimeType,
        // فعلاً کلید را هم می‌فرستیم، هرچند بک‌اند فعلی ممکن است آن را نادیده بگیرد
        // اما برای دیباگ کردن مهم است که در لاگ‌ها باشد
        providedKey: apiKey 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // اینجا تمام جزئیات خطا را برای نمایش در باکس لاگ استخراج می‌کنیم
      const errorDetail = JSON.stringify(data) || response.statusText;
      throw new Error(`Server Error (${response.status}): ${data.message || errorDetail}`);
    }

    return data.answer;

  } catch (error: any) {
    console.error("Connection Error Details:", error);
    // خطای خام را برمی‌گردانیم تا کاربر ببیند
    throw error; 
  }
};
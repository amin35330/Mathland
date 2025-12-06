const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const validateApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  try {
    // تست اتصال با یک جمع ساده
    const result = await solveProblem("2+2", undefined, undefined, apiKey);
    if (result) {
      return { success: true, message: 'اتصال با موفقیت برقرار شد.' };
    }
    return { success: false, message: 'پاسخی دریافت نشد.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'خطا در برقراری ارتباط' };
  }
};

// نام این تابع قبلاً solveMathProblem بود که باعث خطا می‌شد
// الان به solveProblem تغییر کرد تا با Home.tsx هماهنگ شود
export const solveProblem = async (
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
        providedKey: apiKey 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail = JSON.stringify(data) || response.statusText;
      throw new Error(`Server Error (${response.status}): ${data.message || errorDetail}`);
    }

    return data.answer;

  } catch (error: any) {
    console.error("Connection Error Details:", error);
    throw error; 
  }
};
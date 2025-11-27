const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  return apiKey && apiKey.length > 10;
};

export const solveMathProblem = async (
  promptText: string,
  imageBase64: string | undefined,
  imageMimeType: string = 'image/jpeg',
  apiKey: string
): Promise<string> => {

  try {
    // استفاده از بک‌تیک (`) بسیار مهم است
    const response = await fetch(`${API_URL}/ai/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: promptText,
        image: imageBase64,
        mimeType: imageMimeType
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'خطا در دریافت پاسخ از سرور');
    }

    return data.answer;

  } catch (error: any) {
    console.error("Connection Error:", error);
    throw new Error("مشکلی در ارتباط با سرور پیش آمد.");
  }
};
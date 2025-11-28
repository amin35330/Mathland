import admin from 'firebase-admin';

const connectDB = () => {
  try {
    // جلوگیری از اتصال تکراری
    if (admin.apps.length) {
      return;
    }

    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!key) {
      throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY in environment variables');
    }

    let serviceAccount: any;

    // تلاش برای رمزگشایی از حالت Base64
    try {
      // اول فرض می‌کنیم Base64 است و دیکود می‌کنیم
      const decodedBuffer = Buffer.from(key, 'base64').toString('utf-8');
      // اگر خروجی شبیه JSON بود، پارس می‌کنیم
      if (decodedBuffer.trim().startsWith('{')) {
        serviceAccount = JSON.parse(decodedBuffer);
      } else {
        // اگر دیکود شد اما JSON نبود، شاید خودِ رشته اصلی JSON بوده
        serviceAccount = JSON.parse(key);
      }
    } catch (error) {
      // اگر Base64 نبود، تلاش می‌کنیم مستقیم پارس کنیم
      try {
        serviceAccount = JSON.parse(key);
      } catch (jsonError) {
        throw new Error('Failed to parse FIREBASE key. Ensure it is valid JSON or Base64 encoded JSON.');
      }
    }

    // اصلاح فرمت کلید خصوصی (مشکل رایج در ورسل)
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    // بررسی نهایی فیلدهای ضروری
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error('Missing essential fields (project_id, client_email, private_key) in the service account key.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('[database]: Firebase Admin Initialized Successfully');

  } catch (error: any) {
    console.error('[database]: Firebase Connection Error:', error.message);
    // در محیط پروداکشن نباید پروسه را کامل بکشیم تا لاگ‌ها ثبت شوند
  }
};

export default connectDB;
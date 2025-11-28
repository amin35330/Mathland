import * as admin from 'firebase-admin';
import { Buffer } from 'buffer'; // برای دیکد کردن Base64

// اینترفیس برای فایل JSON سرویس اکانت
interface ServiceAccount {
  projectId?: string;
  privateKeyId?: string;
  privateKey?: string;
  clientEmail?: string;
  clientId?: string;
  authUri?: string;
  tokenUri?: string;
  authProviderX509CertUrl?: string;
  clientX509CertUrl?: string;
  universeDomain?: string;
}

let db: admin.firestore.Firestore | null = null;

const connectFirebase = () => {
  if (db) {
    console.log('[database]: Reusing existing Firestore instance.');
    return db;
  }

  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountBase64) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined or empty in environment variables.");
    }

    // --- تغییر مهم: دیکد کردن رشته Base64 به JSON اصلی ---
    const serviceAccountJsonString = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJsonString);

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
        throw new Error("Missing essential fields in FIREBASE_SERVICE_ACCOUNT_KEY after Base64 decode and JSON parse.");
    }

    // این خط دیگر نیازی نیست چون فرض می‌کنیم Base64 دیکد شده و JSON معتبر است
    // و کاراکترهای \n در private_key در خود فایل JSON به درستی ذخیره شده‌اند.
    // اگر باز هم مشکلی بود، ممکن است نیاز باشد private_key را جداگانه replace کنیم.
    // serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });

    db = admin.firestore();
    console.log('[database]: Firebase Firestore initialized successfully.');
    return db;
  } catch (error: any) {
    console.error(`[database]: Failed to initialize Firebase: ${error.message}`);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
};

export const getDb = () => {
    if (!db) {
        throw new Error("Firestore has not been initialized. Call connectFirebase first.");
    }
    return db;
};

export default connectFirebase;
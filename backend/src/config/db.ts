import * as admin from 'firebase-admin';

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
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined in environment variables.");
    }

    // تبدیل رشته JSON به آبجکت
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

    // بررسی فیلدهای ضروری
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
        throw new Error("Missing essential fields in FIREBASE_SERVICE_ACCOUNT_KEY.");
    }

    // اطمینان از مقداردهی خصوصی
    if (serviceAccount.privateKey && serviceAccount.privateKey.includes('\\n')) {
        serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
    }

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
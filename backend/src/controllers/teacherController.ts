import { Request, Response } from 'express';
import admin from 'firebase-admin';

// تابع ایمن برای دریافت دیتابیس
const getDbSafe = () => {
  try {
    if (admin.apps.length === 0) return null;
    return admin.firestore();
  } catch (e) { return null; }
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const db = getDbSafe();
    if (!db) {
       // اگر دیتابیس وصل نبود، آرایه خالی بفرست تا سایت بالا بیاید
       console.warn("Database not connected, returning empty list.");
       return res.json([]);
    }

    const snapshot = await db.collection('teachers').orderBy('createdAt', 'desc').get();
    const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(teachers);
  } catch (error: any) {
    console.error('Error in getTeachers:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست معلمین', error: error.message });
  }
};

export const syncTeachers = async (req: Request, res: Response) => {
  try {
    const db = getDbSafe();
    if (!db) {
        return res.status(503).json({ 
            message: 'اتصال به دیتابیس برقرار نیست. لطفاً تنظیمات فایربیس را چک کنید.' 
        });
    }

    const data = req.body;
    
    // بررسی حجم داده (اگر خیلی زیاد بود هشدار بده)
    if (JSON.stringify(data).length > 4 * 1024 * 1024) {
        return res.status(413).json({
            message: 'حجم تصاویر بسیار زیاد است. لطفاً از تصاویر کم‌حجم‌تر استفاده کنید.'
        });
    }

    const batch = db.batch();
    
    // 1. حذف قدیمی‌ها
    const existingDocs = await db.collection('teachers').listDocuments();
    existingDocs.forEach(doc => batch.delete(doc));
    
    // 2. افزودن جدیدها
    data.forEach((item: any) => {
      const docRef = db.collection('teachers').doc();
      const { id, ...docData } = item;
      batch.set(docRef, { ...docData, createdAt: new Date().toISOString() });
    });

    await batch.commit();
    
    // بازگرداندن لیست جدید
    const snapshot = await db.collection('teachers').get();
    const newItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(newItems);

  } catch (error: any) {
    console.error('Error in syncTeachers:', error);
    res.status(500).json({ message: 'خطا در ذخیره معلمین در دیتابیس', error: error.message });
  }
};
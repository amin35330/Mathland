import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

// دریافت آمار برای نمایش
export const getStats = async (req: Request, res: Response) => {
  try {
    const docRef = getDb().collection('statistics').doc('general');
    const doc = await docRef.get();

    if (!doc.exists) {
      // اگر هنوز آماری نیست، مقادیر صفر برگردان
      return res.json({ total: 0, monthly: 0, daily: 0 });
    }

    const data = doc.data();
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0]; // مثلا 2024-05-20
    const monthKey = todayKey.slice(0, 7); // مثلا 2024-05

    res.json({
      total: data?.total || 0,
      monthly: data?.monthly?.[monthKey] || 0,
      daily: data?.daily?.[todayKey] || 0
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// ثبت بازدید جدید
export const recordVisit = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const docRef = db.collection('statistics').doc('general');
    
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const monthKey = todayKey.slice(0, 7);

    // استفاده از تراکنش اتمیک برای دقت بالا
    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      
      if (!doc.exists) {
        t.set(docRef, {
          total: 1,
          daily: { [todayKey]: 1 },
          monthly: { [monthKey]: 1 }
        });
      } else {
        // آپدیت مقادیر با increment
        t.update(docRef, {
          total: admin.firestore.FieldValue.increment(1),
          [`daily.${todayKey}`]: admin.firestore.FieldValue.increment(1),
          [`monthly.${monthKey}`]: admin.firestore.FieldValue.increment(1)
        });
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error recording visit:', error);
    res.status(500).json({ message: 'Error recording visit' });
  }
};
import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

// دریافت همه کتاب‌ها
export const getBooks = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDb().collection('books').orderBy('createdAt', 'desc').get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(books);
  } catch (error: any) {
    console.error('Error in getBooks:', error);
    res.status(500).json({ message: 'خطا در دریافت کتاب‌ها', error: error.message });
  }
};

// همگام‌سازی کتاب‌ها (حذف همه و درج جدید)
export const syncBooks = async (req: Request, res: Response) => {
  try {
    const booksData = req.body;
    const batch = getDb().batch();
    
    // 1. حذف همه کتاب‌های قبلی
    const existingDocs = await getDb().collection('books').listDocuments();
    existingDocs.forEach(doc => batch.delete(doc));
    
    // 2. افزودن کتاب‌های جدید
    booksData.forEach((book: any) => {
      const docRef = getDb().collection('books').doc(); // ID خودکار
      // فیلد id را حذف می‌کنیم تا خود فایربیس بسازد یا اگر هست استفاده کند
      const { id, ...data } = book; 
      batch.set(docRef, { ...data, createdAt: new Date().toISOString() });
    });

    await batch.commit();
    
    // بازگرداندن لیست جدید
    const snapshot = await getDb().collection('books').get();
    const newBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json(newBooks);
  } catch (error: any) {
    console.error('Error in syncBooks:', error);
    res.status(500).json({ message: 'خطا در ذخیره کتاب‌ها', error: error.message });
  }
};
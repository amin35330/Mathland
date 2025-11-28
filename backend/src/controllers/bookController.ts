import { Request, Response } from 'express';
import { getDb } from '../config/db';
import { Book } from '../models/allModels';
import * as admin from 'firebase-admin';

export const getBooks = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const booksCollection = db.collection('books');
    const snapshot = await booksCollection.orderBy('createdAt', 'desc').get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
    res.json(books);
  } catch (error: any) {
    console.error("Error in getBooks:", error);
    res.status(500).json({ message: 'خطا در دریافت کتاب‌ها', error: error.message });
  }
};

export const syncBooks = async (req: Request, res: Response) => {
  try {
    const booksData: Book[] = req.body;
    const db = getDb();
    const batch = db.batch(); // برای عملیات انبوه

    // 1. همه موارد قبلی را پاک کن
    const currentBooks = await db.collection('books').get();
    currentBooks.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // 2. موارد جدید را اضافه کن
    booksData.forEach(book => {
      const newBookRef = db.collection('books').doc(); // Firestore خودش ID می‌سازد
      batch.set(newBookRef, { 
        ...book, 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    res.json({ message: 'کتاب‌ها با موفقیت ذخیره شدند.' });
  } catch (error: any) {
    console.error("Error in syncBooks:", error);
    res.status(500).json({ message: 'خطا در ذخیره کتاب‌ها', error: error.message });
  }
};
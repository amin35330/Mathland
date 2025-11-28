import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDb().collection('teachers').orderBy('createdAt', 'desc').get();
    const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(teachers);
  } catch (error: any) {
    console.error('Error in getTeachers:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست معلمین', error: error.message });
  }
};

export const syncTeachers = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const batch = getDb().batch();
    
    const existingDocs = await getDb().collection('teachers').listDocuments();
    existingDocs.forEach(doc => batch.delete(doc));
    
    data.forEach((item: any) => {
      const docRef = getDb().collection('teachers').doc();
      const { id, ...docData } = item;
      batch.set(docRef, { ...docData, createdAt: new Date().toISOString() });
    });

    await batch.commit();
    
    const snapshot = await getDb().collection('teachers').get();
    const newItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(newItems);
  } catch (error: any) {
    console.error('Error in syncTeachers:', error);
    res.status(500).json({ message: 'خطا در ذخیره معلمین', error: error.message });
  }
};
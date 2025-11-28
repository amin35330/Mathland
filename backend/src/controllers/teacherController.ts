import { Request, Response } from 'express';
import { getDb } from '../config/db';
import { Teacher } from '../models/allModels';
import * as admin from 'firebase-admin';

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const teachersCollection = db.collection('teachers');
    const snapshot = await teachersCollection.orderBy('createdAt', 'desc').get();
    const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
    res.json(teachers);
  } catch (error: any) {
    console.error("Error in getTeachers:", error);
    res.status(500).json({ message: 'خطا در دریافت لیست معلمین', error: error.message });
  }
};

export const syncTeachers = async (req: Request, res: Response) => {
  try {
    const data: Teacher[] = req.body;
    const db = getDb();
    const batch = db.batch();

    const currentTeachers = await db.collection('teachers').get();
    currentTeachers.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    data.forEach(teacher => {
      const newTeacherRef = db.collection('teachers').doc();
      batch.set(newTeacherRef, { 
        ...teacher,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    res.json({ message: 'معلمین با موفقیت ذخیره شدند.' });
  } catch (error: any) {
    console.error("Error in syncTeachers:", error);
    res.status(500).json({ message: 'خطا در ذخیره معلمین', error: error.message });
  }
};
import { Request, Response } from 'express';
import { getDb } from '../config/db';
import { Video, Paradox, Creator } from '../models/allModels';
import * as admin from 'firebase-admin';

// --- Videos ---
export const getVideos = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('videos').orderBy('createdAt', 'desc').get();
    const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
    res.json(videos);
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: 'خطا در دریافت ویدیوها', error: error.message });
  }
};

export const syncVideos = async (req: Request, res: Response) => {
  try {
    const data: Video[] = req.body;
    const db = getDb();
    const batch = db.batch();

    const currentItems = await db.collection('videos').get();
    currentItems.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    data.forEach(item => {
      const newItemRef = db.collection('videos').doc();
      batch.set(newItemRef, { 
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    res.json({ message: 'ویدیوها با موفقیت ذخیره شدند.' });
  } catch (error: any) {
    console.error("Error syncing videos:", error);
    res.status(500).json({ message: 'خطا در ذخیره ویدیوها', error: error.message });
  }
};

// --- Paradoxes ---
export const getParadoxes = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('paradoxes').orderBy('createdAt', 'desc').get();
    const paradoxes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paradox));
    res.json(paradoxes);
  } catch (error: any) {
    console.error("Error fetching paradoxes:", error);
    res.status(500).json({ message: 'خطا در دریافت پارادوکس‌ها', error: error.message });
  }
};

export const syncParadoxes = async (req: Request, res: Response) => {
  try {
    const data: Paradox[] = req.body;
    const db = getDb();
    const batch = db.batch();

    const currentItems = await db.collection('paradoxes').get();
    currentItems.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    data.forEach(item => {
      const newItemRef = db.collection('paradoxes').doc();
      batch.set(newItemRef, { 
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    res.json({ message: 'پارادوکس‌ها با موفقیت ذخیره شدند.' });
  } catch (error: any) {
    console.error("Error syncing paradoxes:", error);
    res.status(500).json({ message: 'خطا در ذخیره پارادوکس‌ها', error: error.message });
  }
};

// --- Creators ---
export const getCreators = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('creators').orderBy('createdAt', 'desc').get();
    const creators = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Creator));
    res.json(creators);
  } catch (error: any) {
    console.error("Error fetching creators:", error);
    res.status(500).json({ message: 'خطا در دریافت سازندگان', error: error.message });
  }
};

export const syncCreators = async (req: Request, res: Response) => {
  try {
    const data: Creator[] = req.body;
    const db = getDb();
    const batch = db.batch();

    const currentItems = await db.collection('creators').get();
    currentItems.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    data.forEach(item => {
      const newItemRef = db.collection('creators').doc();
      batch.set(newItemRef, { 
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    res.json({ message: 'سازندگان با موفقیت ذخیره شدند.' });
  } catch (error: any) {
    console.error("Error syncing creators:", error);
    res.status(500).json({ message: 'خطا در ذخیره سازندگان', error: error.message });
  }
};
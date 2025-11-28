import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

// تابع کمکی برای سینک کردن هر کالکشن
const syncCollection = async (collectionName: string, dataItems: any[]) => {
    const batch = getDb().batch();
    const existingDocs = await getDb().collection(collectionName).listDocuments();
    existingDocs.forEach(doc => batch.delete(doc));
    
    dataItems.forEach((item: any) => {
        const docRef = getDb().collection(collectionName).doc();
        const { id, ...docData } = item;
        batch.set(docRef, { ...docData, createdAt: new Date().toISOString() });
    });
    await batch.commit();
    
    const snapshot = await getDb().collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Videos ---
export const getVideos = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDb().collection('videos').get();
    const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(videos);
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

export const syncVideos = async (req: Request, res: Response) => {
  try {
    const result = await syncCollection('videos', req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error syncing videos:', error);
    res.status(500).json({ message: 'Error syncing videos', error: error.message });
  }
};

// --- Paradoxes ---
export const getParadoxes = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDb().collection('paradoxes').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching paradoxes:', error);
    res.status(500).json({ message: 'Error fetching paradoxes', error: error.message });
  }
};

export const syncParadoxes = async (req: Request, res: Response) => {
  try {
    const result = await syncCollection('paradoxes', req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error syncing paradoxes:', error);
    res.status(500).json({ message: 'Error syncing paradoxes', error: error.message });
  }
};

// --- Creators ---
export const getCreators = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDb().collection('creators').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ message: 'Error fetching creators', error: error.message });
  }
};

export const syncCreators = async (req: Request, res: Response) => {
  try {
    const result = await syncCollection('creators', req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error syncing creators:', error);
    res.status(500).json({ message: 'Error syncing creators', error: error.message });
  }
};
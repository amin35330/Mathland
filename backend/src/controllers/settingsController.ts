import { Request, Response } from 'express';
import admin from 'firebase-admin';

const getDb = () => admin.firestore();

export const getSettings = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDb().collection('settings').limit(1).get();
    
    if (snapshot.empty) {
      // تنظیمات پیش‌فرض اگر نبود
      const defaultSettings = { appName: 'ریاضی‌یار', adminEmail: '' };
      await getDb().collection('settings').add(defaultSettings);
      return res.json(defaultSettings);
    }
    
    const settings = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    res.json(settings);
  } catch (error: any) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ message: 'خطا در دریافت تنظیمات', error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;
    const snapshot = await getDb().collection('settings').limit(1).get();

    if (snapshot.empty) {
      await getDb().collection('settings').add(newSettings);
    } else {
      const docId = snapshot.docs[0].id;
      await getDb().collection('settings').doc(docId).update(newSettings);
    }
    
    res.json(newSettings);
  } catch (error: any) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ message: 'خطا در ذخیره تنظیمات', error: error.message });
  }
};
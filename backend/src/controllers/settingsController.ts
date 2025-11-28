import { Request, Response } from 'express';
import { getDb } from '../config/db';
import { Settings } from '../models/allModels'; // حالا فقط Settings را ایمپورت می‌کنیم
import * as admin from 'firebase-admin';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const db = getDb(); // دسترسی به اینستنس Firestore
    const settingsCollection = db.collection('settings'); // دریافت کالکشن 'settings'
    const snapshot = await settingsCollection.limit(1).get(); // همیشه فقط یک سند تنظیمات
    let settings: Settings;

    if (snapshot.empty) {
      // ایجاد یک سند پیش‌فرض جدید اگر وجود نداشت
      const defaultSettingsData: Settings = {
        appName: 'ریاضی‌یار',
        appLogoUrl: '',
        adminEmail: 'admin@riaziyar.ir',
        eitaaLink: '',
        rubikaLink: '',
        address: '',
        phone: '',
        copyrightText: '۱۴۰۴ ریاضی‌یار',
        apiKey: '',
      };
      const newDocRef = settingsCollection.doc(); // Firestore خودش ID می‌سازد
      await newDocRef.set({ 
        ...defaultSettingsData, 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      settings = { id: newDocRef.id, ...defaultSettingsData };
      console.log('[settingsController]: Created initial default settings document.');
    } else {
      const doc = snapshot.docs[0];
      settings = { id: doc.id, ...doc.data() } as Settings;
    }
    
    res.json(settings);
  } catch (error: any) {
    console.error("Error in getSettings:", error);
    res.status(500).json({ message: 'خطا در دریافت تنظیمات', error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const newSettings: Settings = req.body;
    const db = getDb();
    const settingsCollection = db.collection('settings');
    const snapshot = await settingsCollection.limit(1).get();

    let savedSettings: Settings;

    if (snapshot.empty) {
      // اگر سند تنظیمات نبود، یک سند جدید ایجاد کن
      const newDocRef = settingsCollection.doc();
      await newDocRef.set({ 
        ...newSettings, 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      savedSettings = { id: newDocRef.id, ...newSettings };
    } else {
      // اگر وجود داشت، آن را آپدیت کن
      const docRef = snapshot.docs[0].ref;
      await docRef.update({ 
        ...newSettings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      savedSettings = { id: docRef.id, ...newSettings };
    }
    
    res.json(savedSettings);
  } catch (error: any) {
    console.error("Error in updateSettings:", error);
    res.status(500).json({ message: 'خطا در ذخیره تنظیمات', error: error.message });
  }
};
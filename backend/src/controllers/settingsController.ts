import { Request, Response } from 'express';
import { Settings } from '../models/allModels';

export const getSettings = async (req: Request, res: Response) => {
  try {
    // همیشه فقط یک تنظیمات داریم، اولین مورد را می‌گیریم
    let settings = await Settings.findOne();
    
    // اگر تنظیماتی نبود (بار اول)، یکی پیش‌فرض بساز
    if (!settings) {
      settings = await Settings.create({
        appName: 'ریاضی‌یار',
        adminEmail: 'admin@riaziyar.ir'
      });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت تنظیمات' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;
    
    // همه را پاک کن و جدید را بساز (چون کلاً یک آبجکت است)
    await Settings.deleteMany({});
    const saved = await Settings.create(newSettings);
    
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ذخیره تنظیمات' });
  }
};
import { Request, Response } from 'express';
import { Settings, ISettings } from '../models/allModels';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    
    // اگر سند تنظیماتی در دیتابیس وجود ندارد، یک سند پیش‌فرض با مقادیر کامل ایجاد کن
    if (!settings) {
      // این مقادیر پیش‌فرض باید با DEFAULT_SETTINGS در فرانت‌اند همخوانی داشته باشند
      // و تمام فیلدهای required در شمای دیتابیس را پوشش دهند.
      const defaultSettingsData: ISettings = {
        appName: 'ریاضی‌یار',
        appLogoUrl: '',
        adminEmail: 'admin@riaziyar.ir',
        eitaaLink: '',
        rubikaLink: '',
        address: '',
        phone: '',
        copyrightText: '۱۴۰۴ ریاضی‌یار',
        apiKey: '',
        // Mongoose automatically adds _id, createdAt, updatedAt
        // So no need to define them here.
      } as ISettings; // Cast to ISettings to ensure type compatibility

      settings = await Settings.create(defaultSettingsData);
      console.log('[settingsController]: Created initial default settings document.');
    }
    
    res.json(settings);
  } catch (error: any) {
    console.error("Error in getSettings:", error);
    res.status(500).json({ message: 'خطا در دریافت تنظیمات', error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;
    
    // از findOneAndUpdate استفاده می‌کنیم که هم سند را پیدا کند و هم آپدیت کند.
    // اگر سندی پیدا نشد، یک سند جدید (upsert) با مقادیر جدید ایجاد می‌کند.
    const saved = await Settings.findOneAndUpdate(
      {}, // به دنبال هر سند تنظیماتی بگرد (چون فقط یکی داریم)
      newSettings, // مقادیر جدید برای آپدیت
      { new: true, upsert: true, runValidators: true } // new: سند جدید را برگردان. upsert: اگر نبود، بساز. runValidators: اعتبارسنجی شمای Mongoose را اجرا کن.
    );
    
    res.json(saved);
  } catch (error: any) {
    console.error("Error in updateSettings:", error);
    res.status(500).json({ message: 'خطا در ذخیره تنظیمات', error: error.message });
  }
};
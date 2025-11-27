import { Request, Response } from 'express';
import { Teacher } from '../models/allModels';

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت لیست معلمین' });
  }
};

export const syncTeachers = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await Teacher.deleteMany({});
    const newItems = await Teacher.insertMany(data);
    res.json(newItems);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ذخیره معلمین' });
  }
};
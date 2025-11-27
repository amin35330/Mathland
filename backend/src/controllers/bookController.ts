import { Request, Response } from 'express';
import { Book } from '../models/allModels';

// دریافت همه کتاب‌ها
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت کتاب‌ها' });
  }
};

// افزودن یا آپدیت کتاب
export const syncBooks = async (req: Request, res: Response) => {
  try {
    const booksData = req.body; // آرایه‌ای از کتاب‌ها می‌آید
    
    // روش ساده: همه را پاک کن و جدیدها را بریز (برای هماهنگی کامل با فرانت)
    // در روش حرفه‌ای‌تر باید یکی‌یکی آپدیت کرد، اما برای شروع این امن‌ترین روش است
    await Book.deleteMany({});
    const newBooks = await Book.insertMany(booksData);
    
    res.json(newBooks);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ذخیره کتاب‌ها' });
  }
};
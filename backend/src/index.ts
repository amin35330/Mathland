import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app: Express = express();

// اتصال به دیتابیس برای هر درخواست
connectDB();

app.use(cors({ origin: '*' })); // دسترسی آزاد برای همه
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// مسیرهای API
app.use('/api', apiRoutes);

// مسیر اصلی برای تست
app.get('/', (req: Request, res: Response) => {
  res.send('Riazi Land Backend is Running on Vercel!');
});

// --- بخش مهم برای Vercel ---
// فقط اگر روی سیستم خودمان بودیم، سرور را روشن کن
// در Vercel این قسمت اجرا نمی‌شود و خود ورسل مدیریت می‌کند
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

// حتماً باید app را اکسپورت کنیم
export default app;
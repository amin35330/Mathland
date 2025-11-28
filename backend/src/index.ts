import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectFirebase from './config/db'; // حالا Firebase را متصل می‌کنیم
import apiRoutes from './routes/apiRoutes';

// متغیرهای محیطی را لود کن (مثل FIREBASE_SERVICE_ACCOUNT_KEY)
dotenv.config();

// اتصال به Firebase Firestore را راه‌اندازی کن
connectFirebase();

const app: Express = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: '*' })); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// استفاده از مسیرهای API
app.use('/api', apiRoutes);

// مسیر تست اصلی
app.get('/', (req: Request, res: Response) => {
  res.send('Riazi Land Backend API is Running on Vercel with Firestore!');
});

// برای Vercel، اپ را اکسپورت می‌کنیم، نه اینکه سرور را روشن کنیم
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}
// یک تغییر ساختگی برای فعال کردن Redeploy در Vercel
export default app;
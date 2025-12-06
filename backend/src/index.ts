import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app: Express = express();
connectDB();

// --- تنظیمات نهایی و قطعی CORS ---
// دامنه‌های مجاز (دامنه پیش‌فرض ورسل + دامنه شخصی شما)
const whitelist = [
  'https://mathland-frontend.vercel.app',
  'https://mathhero.ir',
  'https://www.mathhero.ir'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // اگر مبدا درخواست در لیست سفید بود یا اصلا مبدایی وجود نداشت (مثل درخواست مستقیم یا سرور به سرور)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`); // لاگ برای دیباگ بهتر
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // اجازه ارسال کوکی و هدرهای احراز هویت
};

// مرحله ۱: برای تمام درخواست‌های امنیتی OPTIONS، سریعا پاسخ موفق بده
app.options('*', cors(corsOptions));

// مرحله ۲: برای تمام درخواست‌های دیگر، از همان تنظیمات استفاده کن
app.use(cors(corsOptions));
// ------------------------------------

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', apiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Riazi Land Backend is Running Correctly!');
});

module.exports = app;
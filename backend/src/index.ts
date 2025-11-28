import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app: Express = express();
connectDB();

// --- اصلاح مهم: تنظیمات دقیق CORS ---
const whitelist = [
    'https://mathland-frontend.vercel.app', // آدرس سایت فرانت‌اند شما
    'http://localhost:3000'                // برای تست در آینده روی کامپیوتر
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // اگر آدرس درخواست‌کننده در لیست ما بود، اجازه بده
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
};

app.use(cors(corsOptions));
// ------------------------------------

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', apiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Riazi Land Backend is Running on Vercel!');
});

// این قسمت برای Vercel استفاده نمی‌شود و لازم نیست باشد
// export default app; // ورسل به صورت خودکار فایل را مدیریت می‌کند

// اما برای سازگاری بهتر، این خط را اضافه می‌کنیم
// این به ورسل کمک می‌کند ماژول را درست بشناسد
module.exports = app;
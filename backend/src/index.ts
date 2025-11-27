import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import apiRoutes from './routes/apiRoutes';

// Load environment variables
dotenv.config();

// Connect to Database (این بخش روی سرور Render به درستی کار خواهد کرد)
connectDB();

const app: Express = express();
const port = process.env.PORT || 4000;

// Middleware
// نکته مهم: در آینده آدرس سایت فرانت‌اند را جایگزین '*' می‌کنیم برای امنیت بیشتر
app.use(cors({ origin: '*' })); 

// افزایش حجم مجاز برای آپلود عکس‌ها (به صورت Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// استفاده از مسیرهای API
// تمام آدرس‌ها با /api شروع می‌شوند. مثال: /api/books
app.use('/api', apiRoutes);

// مسیر تست ساده
app.get('/', (req: Request, res: Response) => {
  res.send('Riazi Land Backend API is Running Successfully!');
});

// Start Server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
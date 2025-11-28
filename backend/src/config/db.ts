import mongoose from 'mongoose';

// برای استفاده مجدد از اتصال دیتابیس در محیط‌های Serverless
// این متغیر در خارج از تابع باقی می‌ماند تا بین فراخوانی‌ها حفظ شود
let cachedDbConnection: typeof mongoose | null = null;

const connectDB = async () => {
  // اگر اتصال قبلاً برقرار شده، همان را برگردان
  if (cachedDbConnection) {
    console.log('[database]: Reusing existing MongoDB Connection.');
    return cachedDbConnection;
  }

  // اگر MONGO_URI تنظیم نشده، خطا بده
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  try {
    console.log('[database]: Attempting new MongoDB Connection...');
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: 'MathlandDB', // نام دیتابیس که عملیات روی آن انجام می‌شود
      serverSelectionTimeoutMS: 30000, // 30 ثانیه برای انتخاب سرور منتظر بمان
      socketTimeoutMS: 45000, // 45 ثانیه زمان برای فعالیت سوکت
      // گزینه‌های useNewUrlParser و useUnifiedTopology در Mongoose 6 به بعد پیش‌فرض هستند و نیازی به تعریف صریح ندارند.
    });
    
    cachedDbConnection = conn; // اتصال موفق را ذخیره کن
    console.log(`[database]: MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`[database]: Failed to connect to MongoDB: ${error.message}`);
    // در محیط Serverless نباید process.exit() را فراخوانی کرد.
    // خطا را پرتاب می‌کنیم تا توسط تابع فراخواننده مدیریت شود.
    throw new Error(`Database connection failed: ${error.message}`); 
  }
};

export default connectDB;
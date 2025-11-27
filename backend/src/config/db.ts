import mongoose from 'mongoose';

// تعریف متغیر گلوبال برای نگهداری اتصال
declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // اگر قبلاً وصل شده‌ایم، همان را برگردان (برای سرعت بالا)
  if (cached.conn) {
    return cached.conn;
  }

  // اگر در حال اتصال نیستیم، وصل شو
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI as string, opts).then((mongoose) => {
      console.log('New MongoDB Connection Established');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default connectDB;
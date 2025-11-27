import mongoose, { Schema, Document } from 'mongoose';

// --- 1. Book Schema ---
export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  subject: string;
  imageUrl: string;
  downloadUrl: string;
  rating: number;
}

const BookSchema: Schema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: false },
  subject: { type: String, required: false },
  imageUrl: { type: String, required: false },
  downloadUrl: { type: String, required: false },
  rating: { type: Number, default: 5 },
}, { timestamps: true });

export const Book = mongoose.model<IBook>('Book', BookSchema);


// --- 2. Teacher Schema ---
export interface ITeacher extends Document {
  name: string;
  bio: string;
  experience: string;
  imageUrl: string;
  phone: string;
  email: string;
}

const TeacherSchema: Schema = new Schema({
  name: { type: String, required: true },
  bio: { type: String, required: false },
  experience: { type: String, required: false },
  imageUrl: { type: String, required: false },
  phone: { type: String, required: false },
  email: { type: String, required: false },
}, { timestamps: true });

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);


// --- 3. Video Schema ---
export interface IVideo extends Document {
  title: string;
  tutor: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  videoUrl?: string;
}

const VideoSchema: Schema = new Schema({
  title: { type: String, required: true },
  tutor: { type: String, required: false },
  thumbnailUrl: { type: String, required: false },
  duration: { type: String, required: false },
  category: { type: String, required: false },
  videoUrl: { type: String, required: false },
}, { timestamps: true });

export const Video = mongoose.model<IVideo>('Video', VideoSchema);


// --- 4. Paradox Schema ---
export interface IParadox extends Document {
  title: string;
  summary: string;
  content: string;
}

const ParadoxSchema: Schema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Paradox = mongoose.model<IParadox>('Paradox', ParadoxSchema);


// --- 5. Creator Schema ---
export interface ICreator extends Document {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

const CreatorSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: false },
  imageUrl: { type: String, required: false },
}, { timestamps: true });

export const Creator = mongoose.model<ICreator>('Creator', CreatorSchema);


// --- 6. Settings Schema ---
export interface ISettings extends Document {
  appName: string;
  appLogoUrl: string;
  adminEmail: string;
  eitaaLink: string;
  rubikaLink: string;
  address: string;
  phone: string;
  copyrightText: string;
  apiKey: string;
}

const SettingsSchema: Schema = new Schema({
  appName: { type: String, default: 'ریاضی‌یار' },
  appLogoUrl: { type: String, default: '' },
  adminEmail: { type: String, default: '' },
  eitaaLink: { type: String, default: '' },
  rubikaLink: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  copyrightText: { type: String, default: '' },
  apiKey: { type: String, default: '' }, // We will store GEMINI API KEY here securely
}, { timestamps: true });

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
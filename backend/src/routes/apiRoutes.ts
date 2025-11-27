import express from 'express';
import { getBooks, syncBooks } from '../controllers/bookController';
import { getTeachers, syncTeachers } from '../controllers/teacherController';
import { 
  getVideos, syncVideos, 
  getParadoxes, syncParadoxes, 
  getCreators, syncCreators 
} from '../controllers/contentController';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = express.Router();

// --- Books Routes ---
router.get('/books', getBooks);       // دریافت لیست کتاب‌ها
router.post('/books', syncBooks);     // ذخیره/آپدیت کتاب‌ها (فقط ادمین)

// --- Teachers Routes ---
router.get('/teachers', getTeachers);
router.post('/teachers', syncTeachers);

// --- Content Routes ---
router.get('/videos', getVideos);
router.post('/videos', syncVideos);

router.get('/paradoxes', getParadoxes);
router.post('/paradoxes', syncParadoxes);

router.get('/creators', getCreators);
router.post('/creators', syncCreators);

// --- Settings Routes ---
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

export default router;
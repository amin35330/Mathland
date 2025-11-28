import express from 'express';
import { getBooks, syncBooks } from '../controllers/bookController';
import { getTeachers, syncTeachers } from '../controllers/teacherController';
import { 
  getVideos, syncVideos, 
  getParadoxes, syncParadoxes, 
  getCreators, syncCreators 
} from '../controllers/contentController';
import { getSettings, updateSettings } from '../controllers/settingsController';
// --- اضافه شد ---
import { solveProblem } from '../controllers/aiController'; 

const router = express.Router();

router.get('/books', getBooks);
router.post('/books', syncBooks);

router.get('/teachers', getTeachers);
router.post('/teachers', syncTeachers);

router.get('/videos', getVideos);
router.post('/videos', syncVideos);

router.get('/paradoxes', getParadoxes);
router.post('/paradoxes', syncParadoxes);

router.get('/creators', getCreators);
router.post('/creators', syncCreators);

router.get('/settings', getSettings);
router.post('/settings', updateSettings);

// --- مسیر جدید ---
router.post('/ai/solve', solveProblem);

export default router;
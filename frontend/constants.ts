
import { Book, Paradox, Teacher, Video, Creator, Settings } from "./types";

export const INITIAL_SETTINGS: Settings = {
  appName: 'ریاضی‌یار',
  appLogoUrl: '', // Empty means use default icon
  adminEmail: 'admin@riaziyar.ir',
  eitaaLink: 'https://eitaa.com/',
  rubikaLink: 'https://rubika.ir/',
  address: 'تهران، میدان آزادی، دانشگاه شریف',
  phone: '021-66000000',
  copyrightText: '۱۴۰۴ ریاضی‌یار، تمامی حقوق سایت متعلق به ترانه سادات موسوی و فاطمه شیرعلی پور می‌باشد.',
  apiKey: ''
};

export const INITIAL_CREATORS: Creator[] = [
  {
    id: '1',
    name: 'ترانه سادات موسوی',
    role: 'پایه یازدهم',
    bio: 'علاقه‌مند به برنامه‌نویسی وب و هوش مصنوعی. طراح رابط کاربری پروژه.',
    imageUrl: 'https://picsum.photos/300/300?random=100'
  },
  {
    id: '2',
    name: 'فاطمه شیرعلی پور',
    role: 'پایه یازدهم',
    bio: 'توسعه‌دهنده فرانت‌اند و علاقه‌مند به ریاضیات گسسته. مدیر فنی پروژه.',
    imageUrl: 'https://picsum.photos/300/300?random=101'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'ریاضیات جامع نهم',
    author: 'دکتر علوی',
    description: 'کتاب کار و تمرین برای دانش‌آموزان سال نهم با پاسخ‌های تشریحی و نکات کلیدی.',
    subject: 'ریاضی نهم',
    imageUrl: 'https://picsum.photos/200/300?random=1',
    downloadUrl: '#',
    rating: 4.5,
  },
  {
    id: '2',
    title: 'هندسه به زبان ساده',
    author: 'مهندس حسینی',
    description: 'آموزش گام به گام هندسه اقلیدسی برای دوره اول متوسطه همراه با شکل‌های رنگی.',
    subject: 'هندسه',
    imageUrl: 'https://picsum.photos/200/300?random=2',
    downloadUrl: '#',
    rating: 4.8,
  },
  {
    id: '3',
    title: 'جادوی جبر',
    author: 'خانم اکبری',
    description: 'تکنیک‌های حل سریع معادلات جبری و نامعادلات برای آمادگی در آزمون‌ها.',
    subject: 'جبر و معادلات',
    imageUrl: 'https://picsum.photos/200/300?random=3',
    downloadUrl: '#',
    rating: 4.2,
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: '1',
    name: 'استاد محمدی',
    bio: 'عاشق تدریس ریاضی با روش‌های خلاقانه و مفهومی. هدف من ساده‌سازی پیچیده‌ترین مسائل برای دانش‌آموزان است.',
    experience: '۱۲ سال تدریس در مدارس نمونه دولتی و تیزهوشان',
    imageUrl: 'https://picsum.photos/300/400?random=4',
    phone: '09123456789',
    email: 'mohammadi@example.com'
  },
  {
    id: '2',
    name: 'خانم رضایی',
    bio: 'متخصص هندسه و آموزش تصویری. باور دارم که ریاضیات هنر دیدن الگوهاست.',
    experience: '۸ سال سابقه آموزش آنلاین و حضوری',
    imageUrl: 'https://picsum.photos/300/400?random=5',
    phone: '09987654321',
    email: 'rezaei@example.com'
  },
  {
    id: '3',
    name: 'دکتر کمالی',
    bio: 'دکترای ریاضی محض و مدرس المپیاد. آماده‌سازی دانش‌آموزان برای مسابقات جهانی.',
    experience: '۱۵ سال تدریس دانشگاهی و المپیاد',
    imageUrl: 'https://picsum.photos/300/400?random=6',
    phone: '02188888888',
    email: 'kamali@example.com'
  }
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'آموزش معادله خط',
    tutor: 'استاد محمدی',
    thumbnailUrl: 'https://picsum.photos/300/180?random=6',
    duration: '۱۵:۳۰',
    category: 'نهم',
    videoUrl: '<iframe src="https://www.aparat.com/video/video/embed/videohash/IyQn8/vt/frame" title="آموزش ریاضی نهم - فصل ششم - معادله خط" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>',
  },
  {
    id: '2',
    title: 'فیثاغورس در ۵ دقیقه',
    tutor: 'خانم رضایی',
    thumbnailUrl: 'https://picsum.photos/300/180?random=7',
    duration: '۰۵:۰۰',
    category: 'هشتم',
    videoUrl: '<iframe src="https://www.aparat.com/video/video/embed/videohash/AmZ4k/vt/frame" title="ریاضی هشتم فصل ششم درس اول رابطه فیثاغورس" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>',
  },
  {
    id: '3',
    title: 'اعداد اول و مرکب',
    tutor: 'استاد محمدی',
    thumbnailUrl: 'https://picsum.photos/300/180?random=8',
    duration: '۱۰:۴۵',
    category: 'هفتم',
    videoUrl: '<iframe src="https://www.aparat.com/video/video/embed/videohash/uK5Uv/vt/frame" title="ریاضی هفتم فصل پنجم درس اول عدد اول" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>',
  }
];

export const INITIAL_PARADOXES: Paradox[] = [
  {
    id: '1',
    title: 'پارادوکس زنون',
    summary: 'آیا آشیل هرگز به لاک‌پشت می‌رسد؟',
    content: 'در این پارادوکس، زنون استدلال می‌کند که حرکت غیرممکن است زیرا برای رسیدن به هر نقطه‌ای، باید نیمی از راه را طی کنید، و قبل از آن نیمی از نیمه راه را... \n\nشرح کامل: فرض کنید آشیل که سریع‌ترین دونده است، بخواهد با لاک‌پشتی مسابقه دهد و به او ۱۰ متر آوانس بدهد. وقتی آشیل ۱۰ متر را طی می‌کند، لاک‌پشت کمی جلوتر رفته (مثلا ۱ متر). وقتی آشیل آن ۱ متر را طی می‌کند، لاک‌پشت باز هم کمی جلوتر رفته است (۱۰ سانتی‌متر). این روند تا بی‌نهایت ادامه دارد و به نظر می‌رسد آشیل هرگز به لاک‌پشت نمی‌رسد! راه حل ریاضی این مسئله با استفاده از مفهوم "حد" و "سری‌های همگرا" در ریاضیات حل می‌شود.'
  },
  {
    id: '2',
    title: 'هتل بی‌نهایت هیلبرت',
    summary: 'چگونه یک هتل پر می‌تواند مهمان جدید بپذیرد؟',
    content: 'تصور کنید هتلی با تعداد اتاق‌های بی‌نهایت دارید که تمام اتاق‌های آن پر است. اگر یک مهمان جدید بیاید، آیا می‌توانید به او اتاق بدهید؟ \n\nبله! کافیست مدیر هتل از مهمان اتاق ۱ بخواهد به اتاق ۲ برود، مهمان اتاق ۲ به ۳، و به طور کلی مهمان اتاق n به n+1 برود. حالا اتاق ۱ خالی می‌شود و مهمان جدید می‌تواند در آن ساکن شود. این نشان‌دهنده ویژگی‌های عجیب مجموعه‌های بی‌نهایت است.'
  },
  {
    id: '3',
    title: 'مسأله مونتی هال',
    summary: 'سه درب، یک جایزه. آیا درب خود را عوض می‌کنید؟',
    content: 'شما در یک مسابقه هستید. سه درب وجود دارد. پشت یکی ماشین و پشت دوتای دیگر بز است. شما یک درب را انتخاب می‌کنید (مثلا درب ۱). مجری که می‌داند پشت درب‌ها چیست، یکی از درب‌های پوچ دیگر را باز می‌کند (مثلا درب ۳ که بز دارد). حال به شما پیشنهاد می‌کند انتخابتان را به درب ۲ تغییر دهید. آیا باید عوض کنید؟ \n\nپاسخ ریاضی: بله! اگر تغییر ندهید شانس شما ۱/۳ است، اما اگر تغییر دهید شانس برنده شدن شما به ۲/۳ افزایش می‌یابد.'
  }
];

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './AppContext';
import { Navbar } from './components/Navbar';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Home } from './pages/Home';
import { Books } from './pages/Books';
import { Teachers } from './pages/Teachers';
import { Videos } from './pages/Videos';
import { Paradox } from './pages/Paradox';
import { About } from './pages/About';
import { Admin } from './pages/Admin';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useAppContext();
  return (
    <div className="min-h-screen bg-[#f5f3ff] dark:bg-[#0f172a] transition-colors duration-300 text-gray-800 dark:text-gray-200 font-sans flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow pb-20 relative z-10">
        {children}
      </main>
      <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-white/20 dark:border-gray-800 py-8 text-center text-sm text-gray-500 relative z-10">
        <p className="font-medium">
          {settings.copyrightText}
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/paradox" element={<Paradox />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
}
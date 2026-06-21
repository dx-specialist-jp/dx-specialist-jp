import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import DayPage from './pages/DayPage.jsx';

export default function App() {
  return (
    <HashRouter>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/day/:date" element={<DayPage />} />
        </Routes>
      </main>
    </HashRouter>
  );
}

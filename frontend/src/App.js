import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/public/Home';
import Services from './pages/public/Services';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/staff" element={<div>Staff Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/booking" element={<div>Booking Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;

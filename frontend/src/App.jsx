import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Feed from './components/Feed';
import Portfolio from './components/Portfolio';
import Leaderboard from './components/Leaderboard'; // New
import MyProfile from './components/MyProfile'; // New
import Login from './pages/Login'; // New
import { useUser } from './context/UserContext';

// Guard Component
const PrivateRoute = ({ children }) => {
    const { token } = useUser();
    return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
        </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="pt-6 px-4 flex justify-center">
      <header className="bg-white/80 backdrop-blur-md border border-indigo-100 text-indigo-950 p-3 px-8 rounded-full shadow-lg w-full max-w-5xl">
        <div className="flex justify-between items-center">
          <Link to={user ? "/dashboard" : "/"} className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            CampFIX
          </Link>
          <nav className="flex gap-6 items-center">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-indigo-600 font-semibold transition">Dashboard</Link>
                <Link to="/profile" className="flex items-center gap-2 hover:bg-indigo-50 px-4 py-1.5 rounded-full transition border border-transparent hover:border-indigo-200">
                  <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm">Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="font-semibold hover:text-indigo-600 transition">Log in</Link>
                <Link to="/register" className="bg-indigo-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-800 transition shadow-md text-sm">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-violet-50 text-gray-900 font-sans">
          <Navbar />
          <main className="container mx-auto p-4 py-12 max-w-5xl">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

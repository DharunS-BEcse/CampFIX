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
    <header className="bg-green-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold tracking-tight">CampFIX</Link>
        <nav className="flex gap-4 items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-green-200 font-medium transition">Dashboard</Link>
              <Link to="/profile" className="flex items-center gap-2 hover:bg-green-800 px-3 py-1 rounded transition border border-transparent hover:border-green-600">
                <div className="w-8 h-8 bg-white text-green-700 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-200 font-medium transition">Login</Link>
              <Link to="/register" className="bg-white text-green-700 px-4 py-1 rounded font-bold hover:bg-gray-100 transition shadow-sm">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Navbar />
          <main className="container mx-auto p-4 py-8">
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

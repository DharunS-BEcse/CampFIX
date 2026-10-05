import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-10 rounded-3xl shadow-xl border border-white">
      <div className="flex justify-center mb-6">
         <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">✓</span>
         </div>
      </div>
      <h2 className="text-3xl font-extrabold text-center mb-8 text-indigo-950 tracking-tight">Create Account</h2>
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm rounded-r-xl font-medium">{error}</div>}
      <form onSubmit={handleRegister}>
        <div className="mb-5">
          <label className="block text-gray-500 font-bold text-xs mb-2 uppercase tracking-wider">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-indigo-950"
            required
            placeholder="John Doe"
          />
        </div>
        <div className="mb-5">
          <label className="block text-gray-500 font-bold text-xs mb-2 uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-indigo-950"
            required
            placeholder="you@student.college.edu"
          />
        </div>
        <div className="mb-8">
          <label className="block text-gray-500 font-bold text-xs mb-2 uppercase tracking-wider">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-indigo-950"
            required
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-900 text-white p-4 rounded-2xl font-bold text-lg hover:bg-indigo-800 transition shadow-lg hover:shadow-indigo-900/20 hover:-translate-y-0.5 duration-200">
          Sign Up
        </button>
      </form>
      <p className="text-center mt-8 text-gray-500 font-medium">
        Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition">Log in</Link>
      </p>
    </div>
  );
}

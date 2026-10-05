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
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Create Account</h2>
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 text-sm rounded-r">{error}</div>}
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
            required
            placeholder="John Doe"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
            required
            placeholder="you@student.college.edu"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
            required
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
          Sign Up
        </button>
      </form>
      <p className="text-center mt-6 text-gray-600">
        Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Log in</Link>
      </p>
    </div>
  );
}

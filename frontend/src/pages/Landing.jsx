import { Link, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Landing() {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-20 text-center px-4">
      <h1 className="text-6xl md:text-7xl font-extrabold text-indigo-950 mb-8 tracking-tight max-w-4xl leading-tight">
        Take Control of Your <br/>Campus Environment
      </h1>
      <p className="text-xl text-gray-500 mb-12 max-w-2xl leading-relaxed font-medium">
        Get real-time insights, track maintenance performance, and make smarter community decisions—all from one powerful dashboard.
      </p>
      
      <div className="flex gap-4">
        <Link to="/register" className="bg-indigo-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-800 transition shadow-xl hover:shadow-indigo-900/20 hover:-translate-y-0.5 duration-200">
          Create your Account
        </Link>
      </div>

      {/* Decorative Mockup Area matching the screenshot feel */}
      <div className="mt-24 w-full max-w-5xl bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white shadow-2xl">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-indigo-50 min-h-[300px]">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
             <div className="flex gap-4">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <div className="font-semibold text-gray-400 text-sm">Dashboard Preview</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="h-32 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center flex-col gap-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">📸</div>
                <div className="font-bold text-indigo-950">Report Instantly</div>
             </div>
             <div className="h-32 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center flex-col gap-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">▲</div>
                <div className="font-bold text-indigo-950">Prioritize Issues</div>
             </div>
             <div className="h-32 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center flex-col gap-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">💬</div>
                <div className="font-bold text-indigo-950">Discuss & Resolve</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

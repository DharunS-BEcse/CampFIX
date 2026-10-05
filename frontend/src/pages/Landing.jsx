import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-6">Fix Your Campus, Together.</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        CampFIX empowers students to report, prioritize, and track campus maintenance issues in real-time. 
        Your voice shapes the campus.
      </p>
      
      <div className="flex gap-4">
        <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg">
          Get Started
        </Link>
        <Link to="/login" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg">
          Login
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
          <div className="text-4xl mb-4">📸</div>
          <h3 className="text-xl font-bold mb-2">Report Issues</h3>
          <p className="text-gray-600">Snap a photo and report broken equipment, leaks, or hazards instantly.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-500">
          <div className="text-4xl mb-4">▲</div>
          <h3 className="text-xl font-bold mb-2">Prioritize</h3>
          <p className="text-gray-600">Upvote problems that affect you. The most voted issues get fixed first.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold mb-2">Track Progress</h3>
          <p className="text-gray-600">Watch as the administration updates the status from pending to resolved.</p>
        </div>
      </div>
    </div>
  );
}

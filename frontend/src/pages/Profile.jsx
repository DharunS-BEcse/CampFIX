import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ reports: 0, upvotes: 0 });

  useEffect(() => {
    if (user) {
      // Fetch issues to calculate stats
      api.get('/issues').then(res => {
        const myReports = res.data.filter(issue => issue.reportedBy?._id === user.id).length;
        const myUpvotes = res.data.filter(issue => issue.upvotes.includes(user.id)).length;
        setStats({ reports: myReports, upvotes: myUpvotes });
      }).catch(err => console.error(err));
    }
  }, [user]);

  if (!user) {
    return <div className="text-center mt-10">Please login to view profile.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-8 mb-10 border-b border-gray-100 pb-8">
        <div className="w-28 h-28 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-5xl font-extrabold shadow-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">{user.name}</h2>
          <p className="text-gray-500 text-lg mt-1">{user.email}</p>
          <span className="inline-block mt-3 bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-1.5 rounded-full uppercase font-bold tracking-wider">
            {user.role} Account
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200 hover:shadow-md transition">
          <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Reports</h4>
          <p className="text-4xl font-extrabold text-green-600 mt-2">{stats.reports}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200 hover:shadow-md transition">
          <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Votes</h4>
          <p className="text-4xl font-extrabold text-green-700 mt-2">{stats.upvotes}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 bg-gray-100 text-gray-800 p-3 rounded-lg font-bold hover:bg-gray-200 transition">
          Edit Profile (Coming Soon)
        </button>
        <button onClick={handleLogout} className="flex-1 bg-red-50 text-red-600 p-3 rounded-lg font-bold hover:bg-red-100 border border-red-100 transition">
          Logout
        </button>
      </div>
    </div>
  );
}

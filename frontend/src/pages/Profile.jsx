import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Profile() {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ reports: 0, upvotes: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      // Fetch issues to calculate stats
      api.get('/issues').then(res => {
        const myReports = res.data.filter(issue => issue.reportedBy?._id === user.id).length;
        const myUpvotes = res.data.filter(issue => issue.upvotes.includes(user.id)).length;
        setStats({ reports: myReports, upvotes: myUpvotes });
      }).catch(err => console.error(err));
    }
  }, [user]);

  if (!user) {
    return <div className="text-center mt-10 font-bold">Please login to view profile.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(name, email);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile.");
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-3xl shadow-xl border border-white">
      <div className="flex flex-col md:flex-row items-center gap-10 mb-12 border-b border-gray-100 pb-10">
        <div className="w-32 h-32 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-5xl font-extrabold shadow-inner border-4 border-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left w-full">
          {isEditing ? (
            <div className="space-y-4">
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-950 text-xl"
              />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
              />
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-extrabold text-indigo-950 tracking-tight">{user.name}</h2>
              <p className="text-gray-500 text-lg mt-2">{user.email}</p>
            </>
          )}
          <span className="inline-block mt-4 bg-indigo-50 text-indigo-700 text-xs px-4 py-1.5 rounded-full uppercase font-bold tracking-wider">
            {user.role} Account
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-50 p-8 rounded-3xl text-center border border-gray-100 hover:shadow-md transition">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Reports</h4>
          <p className="text-5xl font-extrabold text-indigo-600 mt-3">{stats.reports}</p>
        </div>
        <div className="bg-gray-50 p-8 rounded-3xl text-center border border-gray-100 hover:shadow-md transition">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Votes</h4>
          <p className="text-5xl font-extrabold text-indigo-700 mt-3">{stats.upvotes}</p>
        </div>
      </div>

      <div className="flex gap-4">
        {isEditing ? (
          <>
            <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 p-4 rounded-2xl font-bold hover:bg-gray-200 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-md">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="flex-1 bg-gray-50 text-indigo-900 border border-gray-200 p-4 rounded-2xl font-bold hover:bg-gray-100 transition">
            Edit Profile
          </button>
        )}
        <button onClick={handleLogout} className="flex-none bg-red-50 text-red-600 p-4 rounded-2xl font-bold hover:bg-red-100 transition px-8">
          Logout
        </button>
      </div>
    </div>
  );
}

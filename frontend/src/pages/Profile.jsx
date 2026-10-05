import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return <div className="text-center mt-10">Please login to view profile.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center gap-6 mb-8 border-b pb-6">
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded uppercase font-bold">
            {user.role}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg text-center border">
          <h4 className="text-gray-500 text-sm font-semibold uppercase">Total Reports</h4>
          <p className="text-3xl font-bold text-blue-600 mt-1">...</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center border">
          <h4 className="text-gray-500 text-sm font-semibold uppercase">Total Upvotes</h4>
          <p className="text-3xl font-bold text-yellow-600 mt-1">...</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 font-medium transition">
          Edit Profile (Coming Soon)
        </button>
        <button onClick={handleLogout} className="flex-1 bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 font-medium transition">
          Logout
        </button>
      </div>
    </div>
  );
}

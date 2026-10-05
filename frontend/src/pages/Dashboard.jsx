import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'resolved'
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/issues');
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpvote = async (id) => {
    try {
      const res = await api.put(`/issues/${id}/upvote`);
      // Update local state
      setIssues(issues.map(issue => issue._id === id ? res.data : issue));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await api.put(`/issues/${id}/status`, { status: 'Resolved' });
      setIssues(issues.map(issue => issue._id === id ? res.data : issue));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    if (image) {
      formData.append('image', image);
    }

    try {
      await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setLocation('');
      setImage(null);
      fetchIssues(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'all') return issue.status !== 'Resolved';
    if (activeTab === 'my') return issue.reportedBy?._id === user?.id;
    if (activeTab === 'resolved') return issue.status === 'Resolved';
    return true;
  });

  if (!user) return <div className="text-center mt-10">Please login to view dashboard.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Campus Issues</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition shadow"
        >
          + Report New Issue
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-300 pb-2">
        <button onClick={() => setActiveTab('all')} className={`font-medium pb-2 border-b-2 ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Active Reports
        </button>
        <button onClick={() => setActiveTab('my')} className={`font-medium pb-2 border-b-2 ${activeTab === 'my' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          My Reports
        </button>
        <button onClick={() => setActiveTab('resolved')} className={`font-medium pb-2 border-b-2 ${activeTab === 'resolved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Resolved
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading issues...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-10 bg-white rounded shadow text-gray-500">No issues found in this category.</div>
      ) : (
        filteredIssues.map((issue) => {
          const hasUpvoted = issue.upvotes.includes(user.id);
          const isOwner = issue.reportedBy?._id === user.id;

          return (
            <div key={issue._id} className={`bg-white p-6 rounded-lg shadow-md mb-4 flex justify-between items-start border-l-4 ${issue.status === 'Resolved' ? 'border-green-500' : issue.status === 'In Progress' ? 'border-blue-500' : 'border-yellow-500'}`}>
              <div className="flex-1">
                <div className="flex gap-3 items-center mb-1">
                  <h3 className="text-xl font-bold">{issue.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {issue.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{issue.description}</p>
                {issue.imageUrl && (
                  <img src={issue.imageUrl} alt="Issue" className="w-full max-w-sm rounded mt-2 mb-3 shadow-sm border" />
                )}
                <div className="flex gap-4 text-sm text-gray-500 items-center">
                  <span>📍 {issue.location}</span>
                  <span>👤 Reported by {issue.reportedBy?.name || 'Unknown'}</span>
                  {user.role === 'admin' && issue.status !== 'Resolved' && (
                    <button onClick={() => handleResolve(issue._id)} className="ml-auto text-green-600 hover:underline font-bold">
                      Mark as Resolved
                    </button>
                  )}
                  {isOwner && issue.status !== 'Resolved' && user.role !== 'admin' && (
                     <button onClick={() => handleResolve(issue._id)} className="ml-auto text-green-600 hover:underline font-bold">
                      Mark as Resolved (Owner)
                   </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center ml-4 pl-4 border-l">
                <button 
                  onClick={() => handleUpvote(issue._id)}
                  disabled={issue.status === 'Resolved'}
                  className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 transition ${
                    issue.status === 'Resolved' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    hasUpvoted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  ▲ {hasUpvoted ? 'Prioritized' : 'Prioritize'}
                </button>
                <span className="text-gray-500 mt-2 font-medium text-lg">{issue.upvoteCount} <span className="text-sm">votes</span></span>
              </div>
            </div>
          )
        })
      )}

      {/* Modal for reporting */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Report New Issue</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="e.g. Broken AC in Lab 2" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="e.g. CS Block, 2nd Floor" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 h-24" placeholder="Provide details about the issue..."></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-1">Photo Evidence (Optional)</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-800 p-2 rounded font-medium hover:bg-gray-300 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded font-medium hover:bg-green-700 transition">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

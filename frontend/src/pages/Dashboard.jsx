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
    // 1. Find the issue and do an Optimistic UI update instantly
    const issueToUpdate = issues.find(i => i._id === id);
    if (!issueToUpdate || issueToUpdate.status === 'Resolved') return;

    const hasUpvoted = issueToUpdate.upvotes.includes(user.id);
    const updatedUpvotes = hasUpvoted 
      ? issueToUpdate.upvotes.filter(uid => uid !== user.id)
      : [...issueToUpdate.upvotes, user.id];
      
    const optimisticIssue = { 
      ...issueToUpdate, 
      upvotes: updatedUpvotes, 
      upvoteCount: updatedUpvotes.length 
    };

    setIssues(issues.map(issue => issue._id === id ? optimisticIssue : issue));

    // 2. Perform background API call
    try {
      await api.put(`/issues/${id}/upvote`);
    } catch (err) {
      console.error(err);
      // Revert if API fails
      setIssues(issues.map(issue => issue._id === id ? issueToUpdate : issue));
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    
    // Optimistic delete
    const previousIssues = [...issues];
    setIssues(issues.filter(issue => issue._id !== id));

    try {
      await api.delete(`/issues/${id}`);
    } catch (err) {
      console.error(err);
      setIssues(previousIssues); // Revert
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Close modal immediately for "fast submit" feel
    setShowModal(false);

    // Optimistic temp issue (so it shows up on screen instantly)
    const tempId = Date.now().toString();
    const tempIssue = {
      _id: tempId,
      title,
      description,
      location,
      status: 'Pending',
      upvoteCount: 0,
      upvotes: [],
      reportedBy: { _id: user.id, name: user.name },
      imageUrl: image ? URL.createObjectURL(image) : '',
      isOptimistic: true // flag for styling if needed
    };
    
    // Put the new issue at the top of the list instantly
    setIssues([tempIssue, ...issues]);

    // Save variables for API call and clear form
    const currentTitle = title;
    const currentDesc = description;
    const currentLocation = location;
    const currentImage = image;
    
    setTitle('');
    setDescription('');
    setLocation('');
    setImage(null);

    // API Call in background
    const formData = new FormData();
    formData.append('title', currentTitle);
    formData.append('description', currentDesc);
    formData.append('location', currentLocation);
    if (currentImage) formData.append('image', currentImage);

    try {
      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Replace the temp issue with the real one from the server
      setIssues(prev => prev.map(issue => issue._id === tempId ? res.data : issue));
    } catch (err) {
      console.error(err);
      // Remove temp issue if it failed to upload
      setIssues(prev => prev.filter(issue => issue._id !== tempId));
      alert("Failed to submit report. Please try again.");
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Campus Issues</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-600 transition shadow-md flex items-center gap-2"
        >
          <span>+</span> Report New Issue
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        <button onClick={() => setActiveTab('all')} className={`font-semibold pb-3 border-b-2 transition ${activeTab === 'all' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
          Active Reports
        </button>
        <button onClick={() => setActiveTab('my')} className={`font-semibold pb-3 border-b-2 transition ${activeTab === 'my' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
          My Reports
        </button>
        <button onClick={() => setActiveTab('resolved')} className={`font-semibold pb-3 border-b-2 transition ${activeTab === 'resolved' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
          Resolved
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading issues...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">No issues found in this category.</div>
      ) : (
        filteredIssues.map((issue) => {
          const hasUpvoted = issue.upvotes.includes(user.id);
          const isOwner = issue.reportedBy?._id === user.id;

          return (
            <div key={issue._id} className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition mb-5 flex justify-between items-start border-l-4 ${issue.isOptimistic ? 'opacity-70 border-gray-300' : issue.status === 'Resolved' ? 'border-gray-400 opacity-80' : 'border-emerald-500'}`}>
              <div className="flex-1 pr-6">
                <div className="flex gap-3 items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {issue.title} {issue.isOptimistic && <span className="text-xs text-emerald-500 font-normal ml-2">(Uploading...)</span>}
                  </h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${issue.status === 'Resolved' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-800'}`}>
                    {issue.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{issue.description}</p>
                {issue.imageUrl && (
                  <img src={issue.imageUrl} alt="Issue" className="w-full max-w-md rounded-lg mb-4 shadow-sm border border-gray-100 object-cover max-h-64" />
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 items-center">
                  <span className="flex items-center gap-1"><span className="text-gray-400">📍</span> {issue.location}</span>
                  <span className="flex items-center gap-1"><span className="text-gray-400">👤</span> {issue.reportedBy?.name || 'Unknown'}</span>
                  
                  {/* Mark as Resolved button */}
                  {(user.role === 'admin' || isOwner) && issue.status !== 'Resolved' && (
                    <button onClick={() => handleResolve(issue._id)} className="ml-auto text-emerald-600 hover:text-emerald-700 hover:underline font-bold">
                      ✓ Mark as Resolved
                    </button>
                  )}
                  
                  {/* Delete button for owners/admin */}
                  {(isOwner || user.role === 'admin') && (
                     <button onClick={() => handleDelete(issue._id)} className={`${issue.status !== 'Resolved' ? 'ml-4' : 'ml-auto'} text-red-500 hover:text-red-700 hover:underline font-bold`}>
                      🗑️ Delete
                   </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center ml-4 pl-6 border-l border-gray-100">
                <button 
                  onClick={() => handleUpvote(issue._id)}
                  disabled={issue.status === 'Resolved' || issue.isOptimistic}
                  className={`px-5 py-2.5 rounded-lg font-bold flex flex-col items-center justify-center transition min-w-[100px] ${
                    issue.status === 'Resolved' || issue.isOptimistic ? 'bg-gray-50 text-gray-400 cursor-not-allowed' :
                    hasUpvoted ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  <span className="text-lg leading-none mb-1">▲</span>
                  <span className="text-sm">{hasUpvoted ? 'Prioritized' : 'Prioritize'}</span>
                </button>
                <div className="mt-3 text-center">
                  <span className="block text-2xl font-extrabold text-gray-800 leading-none">{issue.upvoteCount}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">votes</span>
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* Modal for reporting */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-extrabold mb-6 text-gray-800">Report New Issue</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Issue Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" placeholder="e.g. Broken AC in Lab 2" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" placeholder="e.g. CS Block, 2nd Floor" />
              </div>
              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition h-28 resize-none" placeholder="Provide details about the issue..."></textarea>
              </div>
              <div className="mb-8">
                <label className="block text-gray-700 font-semibold mb-2">Photo Evidence (Optional)</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer transition" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-white p-3 rounded-lg font-bold hover:bg-emerald-600 transition shadow-md">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

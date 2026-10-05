import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'resolved'
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Comments UI state
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

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
    const issueToUpdate = issues.find(i => i._id === id);
    if (!issueToUpdate || issueToUpdate.status === 'Resolved') return;

    const hasUpvoted = issueToUpdate.upvotes.includes(user.id);
    const updatedUpvotes = hasUpvoted 
      ? issueToUpdate.upvotes.filter(uid => uid !== user.id)
      : [...issueToUpdate.upvotes, user.id];
      
    const optimisticIssue = { ...issueToUpdate, upvotes: updatedUpvotes, upvoteCount: updatedUpvotes.length };
    setIssues(issues.map(issue => issue._id === id ? optimisticIssue : issue));

    try {
      await api.put(`/issues/${id}/upvote`);
    } catch (err) {
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
    const previousIssues = [...issues];
    setIssues(issues.filter(issue => issue._id !== id));
    try {
      await api.delete(`/issues/${id}`);
    } catch (err) {
      setIssues(previousIssues);
    }
  };

  const handleCommentSubmit = async (e, id) => {
    e.preventDefault();
    const text = commentText[id];
    if (!text?.trim()) return;

    try {
      const res = await api.post(`/issues/${id}/comment`, { text });
      setIssues(issues.map(issue => issue._id === id ? res.data : issue));
      setCommentText(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(false);

    const tempId = Date.now().toString();
    const tempIssue = {
      _id: tempId, title, description, location, status: 'Pending', upvoteCount: 0, upvotes: [], comments: [],
      reportedBy: { _id: user.id, name: user.name },
      createdAt: new Date().toISOString(),
      imageUrl: image ? URL.createObjectURL(image) : '',
      isOptimistic: true
    };
    
    setIssues([tempIssue, ...issues]);

    const currentTitle = title; const currentDesc = description; const currentLocation = location; const currentImage = image;
    setTitle(''); setDescription(''); setLocation(''); setImage(null);

    const formData = new FormData();
    formData.append('title', currentTitle);
    formData.append('description', currentDesc);
    formData.append('location', currentLocation);
    if (currentImage) formData.append('image', currentImage);

    try {
      const res = await api.post('/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setIssues(prev => prev.map(issue => issue._id === tempId ? res.data : issue));
    } catch (err) {
      setIssues(prev => prev.filter(issue => issue._id !== tempId));
      alert("Failed to submit report.");
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'all') return issue.status !== 'Resolved';
    if (activeTab === 'my') return issue.reportedBy?._id === user?.id;
    if (activeTab === 'resolved') return issue.status === 'Resolved';
    return true;
  });

  if (!user) return <div className="text-center mt-10 font-bold">Please login to view dashboard.</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-extrabold text-indigo-950 tracking-tight">Dashboard</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-900 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-800 transition shadow-lg flex items-center gap-2"
        >
          <span>+</span> Create Report
        </button>
      </div>

      <div className="flex gap-8 mb-8 border-b border-gray-200">
        {['all', 'my', 'resolved'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`font-semibold pb-3 border-b-2 transition capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-950' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            {tab === 'all' ? 'Active Reports' : tab === 'my' ? 'My Reports' : 'Resolved'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading data...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-white text-gray-500 font-medium">No reports match this criteria.</div>
      ) : (
        <div className="grid gap-6">
          {filteredIssues.map((issue) => {
            const hasUpvoted = issue.upvotes.includes(user.id);
            const isOwner = issue.reportedBy?._id === user.id;
            const issueDate = new Date(issue.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div key={issue._id} className={`bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition border border-white ${issue.isOptimistic ? 'opacity-60' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-indigo-950">{issue.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wider ${issue.status === 'Resolved' ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-700'}`}>
                        {issue.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm font-medium text-gray-400">
                      <span>{issueDate}</span>
                      <span>•</span>
                      <span>👤 {issue.reportedBy?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>📍 {issue.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => handleUpvote(issue._id)}
                      disabled={issue.status === 'Resolved' || issue.isOptimistic}
                      className={`px-6 py-2 rounded-xl font-bold flex items-center justify-center transition gap-2 ${
                        issue.status === 'Resolved' || issue.isOptimistic ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        hasUpvoted ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-700 border border-indigo-100 hover:bg-indigo-50'
                      }`}
                    >
                      <span>▲</span> {hasUpvoted ? 'Prioritized' : 'Prioritize'}
                    </button>
                    <div className="pr-4 text-center min-w-[3rem]">
                      <span className="block text-xl font-extrabold text-indigo-950 leading-none">{issue.upvoteCount}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed bg-gray-50 p-4 rounded-2xl">{issue.description}</p>
                
                {issue.imageUrl && (
                  <img src={issue.imageUrl} alt="Issue" className="w-full max-w-2xl rounded-2xl mb-6 shadow-sm border border-gray-100 object-cover max-h-80" />
                )}
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <button 
                    onClick={() => setExpandedComments(p => ({...p, [issue._id]: !p[issue._id]}))}
                    className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition flex items-center gap-1"
                  >
                    💬 {issue.comments?.length || 0} Comments
                  </button>
                  <div className="flex gap-4">
                    {(user.role === 'admin' || isOwner) && issue.status !== 'Resolved' && (
                      <button onClick={() => handleResolve(issue._id)} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                        ✓ Resolve
                      </button>
                    )}
                    {(isOwner || user.role === 'admin') && (
                       <button onClick={() => handleDelete(issue._id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">
                        🗑️ Delete
                     </button>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[issue._id] && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                      {issue.comments?.length === 0 && <p className="text-sm text-gray-400 italic">No comments yet. Be the first to discuss!</p>}
                      {issue.comments?.map((comment, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 text-sm">
                          <div className="font-bold text-indigo-950 mb-1">{comment.user?.name || 'Unknown'} <span className="font-normal text-gray-400 text-xs ml-2">{new Date(comment.date).toLocaleDateString()}</span></div>
                          <div className="text-gray-600">{comment.text}</div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={(e) => handleCommentSubmit(e, issue._id)} className="flex gap-2">
                      <input 
                        type="text" 
                        value={commentText[issue._id] || ''} 
                        onChange={e => setCommentText(p => ({...p, [issue._id]: e.target.value}))}
                        placeholder="Write a comment..." 
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button type="submit" className="bg-indigo-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-800 transition">Post</button>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal for reporting */}
      {showModal && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-white">
            <h3 className="text-3xl font-extrabold mb-6 text-indigo-950">New Report</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-500 font-bold text-sm mb-2 uppercase tracking-wider">Issue Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium" placeholder="What's broken?" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-500 font-bold text-sm mb-2 uppercase tracking-wider">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium" placeholder="Where is it?" />
              </div>
              <div className="mb-5">
                <label className="block text-gray-500 font-bold text-sm mb-2 uppercase tracking-wider">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition h-28 resize-none font-medium" placeholder="Details..."></textarea>
              </div>
              <div className="mb-8">
                <label className="block text-gray-500 font-bold text-sm mb-2 uppercase tracking-wider">Photo (Optional)</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer transition" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 p-4 rounded-2xl font-bold hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-900 text-white p-4 rounded-2xl font-bold hover:bg-indigo-800 transition shadow-md">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

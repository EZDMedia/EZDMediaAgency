import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Plus, MessageSquare, LogOut, Loader2, Trash2, Users } from 'lucide-react';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [role, setRole] = useState(localStorage.getItem('adminRole'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminRole', data.user.role);
        setToken(data.token);
        setRole(data.user.role);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="EZD MEDIA" className="h-10 md:h-12 w-auto object-contain mx-auto" />
          <p className="text-gray-400 text-sm tracking-widest uppercase mt-2">Admin Portal</p>
        </div>
        <form onSubmit={handleLogin} className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">Login</h2>
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard token={token} role={role || 'admin'} onLogout={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminRole'); setToken(null); setRole(null); }} />;
}

function AdminDashboard({ token, role, onLogout }: { token: string, role: string, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'messages' | 'accounts'>('portfolio');
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#0A0A0A] border-r border-white/10 p-6 flex flex-col">
        <div className="mb-12">
          <img src="/logo.png" alt="EZD MEDIA" className="h-8 md:h-10 w-auto object-contain mb-1" />
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Admin</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'portfolio' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Plus size={18} /> Add Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare size={18} /> Inquiries
          </button>
          {role === 'super_admin' && (
            <button 
              onClick={() => setActiveTab('accounts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'accounts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Users size={18} /> Accounts
            </button>
          )}
        </nav>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors mt-auto"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'portfolio' && <PortfolioManager token={token} />}
        {activeTab === 'messages' && <MessagesViewer token={token} />}
        {activeTab === 'accounts' && role === 'super_admin' && <AccountsManager token={token} />}
      </div>
    </div>
  );
}

function PortfolioManager({ token }: { token: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    category: '',
    category_ar: '',
    features: '',
    features_ar: ''
  });

  const fetchItems = () => {
    setFetching(true);
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setFetching(false);
      })
      .catch(err => {
        console.error(err);
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      name_ar: item.name_ar || '',
      category: item.category || '',
      category_ar: item.category_ar || '',
      features: item.features || '',
      features_ar: item.features_ar || ''
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?")) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchItems();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !file) return alert("Please select an image for new items");
    setLoading(true);
    setSuccess(false);

    try {
      let imageUrl = undefined;
      
      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadData
        });
        const uploadResult = await uploadRes.json();
        if (!uploadResult.url) throw new Error(uploadResult.error || "Upload failed");
        imageUrl = uploadResult.url;
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/portfolio/${editingId}` : '/api/portfolio';
      
      const payload: any = { ...formData };
      if (imageUrl) payload.image_url = imageUrl;
      // If editing and no new image, image_url is omitted, but our backend expects it.
      // Let's fetch the existing item to get its image_url if we aren't uploading a new one.
      if (editingId && !imageUrl) {
        const existingItem = items.find(i => i.id === editingId);
        if (existingItem) payload.image_url = existingItem.image_url;
      }

      const portfolioRes = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (portfolioRes.ok) {
        setSuccess(true);
        setFormData({ name: '', name_ar: '', category: '', category_ar: '', features: '', features_ar: '' });
        setFile(null);
        setEditingId(null);
        fetchItems();
      } else {
        const err = await portfolioRes.json();
        alert(err.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', name_ar: '', category: '', category_ar: '', features: '', features_ar: '' });
    setFile(null);
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-heading font-bold mb-8">{editingId ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
      
      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
          Portfolio item {editingId ? 'updated' : 'added'} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 mb-16">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Project Details (English)</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">Project Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">Category (e.g., Travel Agency)</label>
              <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Features / Details (comma separated or short description)</label>
            <textarea rows={3} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" placeholder="e.g. Custom Booking System, High-Speed CDN, SEO Optimized" />
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8" dir="rtl">
          <h3 className="text-xl font-bold mb-6">تفاصيل المشروع (Arabic)</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">اسم المشروع</label>
              <input type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">الفئة (مثال: وكالة سفر)</label>
              <input type="text" value={formData.category_ar} onChange={e => setFormData({...formData, category_ar: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">المميزات / التفاصيل</label>
            <textarea rows={3} value={formData.features_ar} onChange={e => setFormData({...formData, features_ar: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" placeholder="مثال: نظام حجز مخصص، شبكة توصيل محتوى سريعة، تحسين محركات البحث" />
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Project Image {editingId && '(Leave empty to keep current)'}</h3>
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-ezd-blue/50 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setFile(e.target.files?.[0] || null)} 
              className="hidden" 
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <Upload size={32} className="text-gray-400 mb-4" />
              <span className="text-white font-medium mb-1">{file ? file.name : "Click to upload image"}</span>
              <span className="text-sm text-gray-500">High-res JPG, PNG, or WebP</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Update Item' : 'Publish Item')}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={cancelEdit}
              className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-heading font-bold mb-6">Existing Portfolio Items</h2>
      {fetching ? (
        <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" /> Loading items...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500 bg-[#0A0A0A] p-8 rounded-3xl border border-white/10 text-center">
          No portfolio items yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">{item.category}</span>
                </div>
                <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-2">{item.features}</p>
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => handleEdit(item)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesViewer({ token }: { token: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contact', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setMessages(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" /> Loading messages...</div>;

  return (
    <div className="max-w-5xl">
      <h2 className="text-3xl font-heading font-bold mb-8">Inquiries</h2>
      
      {messages.length === 0 ? (
        <div className="text-gray-500 bg-[#0A0A0A] p-8 rounded-3xl border border-white/10 text-center">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-ezd-blue text-sm hover:underline">{msg.email}</a>
                </div>
                <div className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {msg.agency_type}
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
              <div className="mt-4 text-xs text-gray-600">
                Received: {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountsManager({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setUsers(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('User added successfully');
        setEmail('');
        setPassword('');
        setRole('admin');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to add user');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="max-w-5xl">
      <h2 className="text-3xl font-heading font-bold mb-8">Accounts Management</h2>
      
      <form onSubmit={handleAddUser} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 mb-12">
        <h3 className="text-xl font-bold mb-6">Add New Account</h3>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">{success}</div>}
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Password</label>
            <input 
              type="text" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">Role</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50 appearance-none"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={submitting}
          className="py-3 px-6 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Add Account</>}
        </button>
      </form>

      <h3 className="text-2xl font-heading font-bold mb-6">Existing Accounts</h3>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" /> Loading accounts...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="py-4 px-4 font-medium">ID</th>
                <th className="py-4 px-4 font-medium">Email</th>
                <th className="py-4 px-4 font-medium">Role</th>
                <th className="py-4 px-4 font-medium">Password (Dev)</th>
                <th className="py-4 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-gray-500">#{user.id}</td>
                  <td className="py-4 px-4 font-medium">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-3 py-1 rounded-full border ${user.role === 'super_admin' ? 'bg-ezd-blue/10 border-ezd-blue/30 text-ezd-blue' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-gray-400">{user.plain_password || '***'}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors inline-flex"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
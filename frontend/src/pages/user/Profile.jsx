// Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API, { postAPI, logAPI } from '../../utils/api';
import { PageHeader, Card, Badge, Button, Input, Textarea, Modal } from '../../components/common/UI';
import PostCard from '../../components/user/PostCard';
import SessionBar from '../../components/user/SessionBar';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', mobile: user?.mobile || '', bio: user?.bio || '', skills: user?.skills?.join(', ') || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    postAPI.getMyPosts({ limit: 20 }).then(r => setPosts(r.data.posts)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/auth/update-profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditOpen(false);
    } catch { toast.error('Update failed.'); }
    setSaving(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
  const approved = posts.filter(p => p.approvalStatus === 'approved').length;
  const totalLikes = posts.reduce((s, p) => s + (p.likesCount||0), 0);

  return (
    <div>
      <PageHeader title="My Profile">
        <Button variant="ghost" onClick={() => setEditOpen(true)}>Edit Profile</Button>
      </PageHeader>
      <div className="p-6 max-w-3xl">
        <SessionBar/>
        {/* Profile hero */}
        <Card className="mb-5">
          <div className="flex items-start gap-5">
            {user?.profileImage
              ? <img src={user.profileImage} className="w-16 h-16 rounded-full object-cover flex-shrink-0"/>
              : <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--neon), var(--purple))' }}>{initials}</div>
            }
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
                <Badge status="active">Active</Badge>
              </div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.mobile}</div>
              {user?.bio && <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>}
              {user?.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap">{user.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            {[['Posts', posts.length], ['Approved', approved], ['Likes', totalLikes]].map(([l, v]) => (
              <div key={l} className="text-center">
                <div className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{v}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Posts */}
        <h3 className="font-display font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>My Posts ({posts.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((p, i) => (
            <PostCard key={p._id} post={p} index={i} showActions showStatus
              onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))}/>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
          <Input label="Mobile" value={form.mobile} onChange={e => setForm(f=>({...f,mobile:e.target.value}))}/>
          <Textarea label="Bio" rows={3} value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} placeholder="Tell clients about yourself…"/>
          <Input label="Skills (comma separated)" value={form.skills} onChange={e => setForm(f=>({...f,skills:e.target.value}))}/>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Notifications.jsx
export function Notifications() {
  const notifications = [
    { icon:'❤️', text:'Sara Kim liked your post "Full-Stack Web App Development"', time:'2 min ago', read:false },
    { icon:'💬', text:'Dev Rao commented: "Great work! Would love to collaborate."', time:'45 min ago', read:false },
    { icon:'✅', text:'Your post was approved by admin and is now live', time:'3h ago', read:false },
    { icon:'⏰', text:'Session reminder: Your session expires in 4 hours.', time:'Today 9:00 AM', read:true },
    { icon:'❌', text:'Your post "Old Draft" was rejected — Reason: incomplete information', time:'Yesterday', read:true },
    { icon:'🔔', text:'New user followed your profile', time:'2 days ago', read:true },
  ];

  return (
    <div>
      <PageHeader title="Notifications">
        <Button variant="ghost" size="sm">Mark all read</Button>
      </PageHeader>
      <div className="p-6 max-w-2xl">
        <div className="surface-card divide-y" style={{ borderColor: 'var(--border)' }}>
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-4 p-4" style={{ background: n.read ? 'transparent' : 'rgba(59,130,246,0.03)' }}>
              <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
              <div className="flex-1">
                <p className="text-sm leading-relaxed" style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.text}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--neon)' }}/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// EditPost.jsx
export function EditPost() {
  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h1 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Edit Post</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Edit form loads post data from API — same structure as CreatePost but pre-filled and re-submits for admin review.</p>
      </div>
    </div>
  );
}

export default Profile;

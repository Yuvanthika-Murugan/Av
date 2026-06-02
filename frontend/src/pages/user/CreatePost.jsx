import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiInfo } from 'react-icons/fi';
import { postAPI } from '../../utils/api';
import { PageHeader, Button, Input, Select, Textarea } from '../../components/common/UI';
import toast from 'react-hot-toast';

const CATEGORIES = ['Web Development', 'Mobile', 'Design', 'AI/ML', 'DevOps', 'Marketing', 'Writing', 'Data Science', 'Other'];

export default function CreatePost() {
  const [form, setForm] = useState({ title: '', description: '', category: 'Web Development', budget: '', skills: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();
  const navigate = useNavigate();

  const set = (f) => (e) => setForm(prev => ({...prev, [f]: e.target.value}));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters.';
    if (!form.description.trim() || form.description.length < 20) e.description = 'Description must be at least 20 characters.';
    if (!form.budget.trim()) e.budget = 'Budget is required.';
    if (!form.skills.trim()) e.skills = 'Add at least one skill.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await postAPI.createPost(data);
      toast.success('Post submitted for admin approval!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post.');
    }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader title="Create Post" subtitle="Share your freelancer skills with the world"/>
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Portfolio Image (optional)</label>
            {preview ? (
              <div className="relative rounded-xl overflow-hidden" style={{ height: 200 }}>
                <img src={preview} alt="Preview" className="w-full h-full object-cover"/>
                <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-white"
                  style={{ background: 'rgba(0,0,0,0.6)' }}><FiX size={14}/></button>
              </div>
            ) : (
              <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
                <FiUpload size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }}/>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Click to upload image</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WebP up to 10MB</p>
              </div>
            )}
          </div>

          <Input label="Post Title *" placeholder="e.g. Full-Stack React Developer for Hire"
            value={form.title} onChange={set('title')} error={errors.title}/>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category *" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Input label="Budget Range *" placeholder="e.g. $1,000–$3,000"
              value={form.budget} onChange={set('budget')} error={errors.budget}/>
          </div>

          <Input label="Skills *" placeholder="React, Node.js, MongoDB (comma separated)"
            value={form.skills} onChange={set('skills')} error={errors.skills}/>

          <Textarea label="Description *" rows={5}
            placeholder="Describe your expertise, experience, past projects, and what you offer clients…"
            value={form.description} onChange={set('description')} error={errors.description}/>

          {/* Info box */}
          <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <FiInfo size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }}/>
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--amber)' }}>Approval Workflow</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Your post will be reviewed by an admin before going live. You'll be notified once it's approved or rejected. Approved posts appear in the public feed.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)} type="button">Cancel</Button>
            <Button type="submit" loading={loading}>Submit for Approval</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

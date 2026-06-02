import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FiFileText, FiHeart, FiMessageCircle, FiCheckCircle, FiPlusCircle, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { postAPI, logAPI } from '../../utils/api';
import { PageHeader, StatCard, Card, Badge, Avatar, Skeleton } from '../../components/common/UI';
import SessionBar from '../../components/user/SessionBar';

const chartData = [
  { day: 'Mon', likes: 4, comments: 2 }, { day: 'Tue', likes: 7, comments: 4 },
  { day: 'Wed', likes: 5, comments: 3 }, { day: 'Thu', likes: 12, comments: 6 },
  { day: 'Fri', likes: 9, comments: 5 }, { day: 'Sat', likes: 15, comments: 8 },
  { day: 'Sun', likes: 18, comments: 10 }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [postsRes, sessRes] = await Promise.all([
          postAPI.getMyPosts({ limit: 5 }),
          logAPI.getMySessions()
        ]);
        setPosts(postsRes.data.posts);
        setSessions(sessRes.data.logs);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const approved = posts.filter(p => p.approvalStatus === 'approved').length;
  const pending  = posts.filter(p => p.approvalStatus === 'pending').length;
  const totalLikes = posts.reduce((s, p) => s + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.commentsCount || 0), 0);

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`} subtitle="Here's what's happening today">
        <Link to="/create-post" className="btn-neon"><FiPlusCircle size={15}/> New Post</Link>
      </PageHeader>

      <div className="p-6">
        <SessionBar/>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stats-grid">
          <StatCard label="My Posts"       value={posts.length}    change={`${approved} approved`}  changeType="up"   icon={FiFileText}     accent="blue"   />
          <StatCard label="Total Likes"    value={totalLikes}      change="+12 this week"            changeType="up"   icon={FiHeart}        accent="green"  />
          <StatCard label="Comments"       value={totalComments}   change="+5 today"                 changeType="up"   icon={FiMessageCircle}accent="amber"  />
          <StatCard label="Approved"       value={approved}        change={`${pending} pending`}     changeType="down" icon={FiCheckCircle}  accent="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Engagement (Last 7 Days)</h2>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>Likes</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"/>Comments</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="likes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--neon)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--neon)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="comments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }}/>
                <Area type="monotone" dataKey="likes" stroke="var(--neon)" strokeWidth={2} fill="url(#likes)"/>
                <Area type="monotone" dataKey="comments" stroke="var(--purple)" strokeWidth={2} fill="url(#comments)"/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Posts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>My Recent Posts</h2>
              <Link to="/create-post" className="btn-ghost text-xs py-1 px-2.5"><FiPlusCircle size={12}/> New</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-12"/>)}</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No posts yet.</p>
                <Link to="/create-post" className="btn-neon mt-3 text-xs">Create your first post</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map(p => (
                  <div key={p._id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
                      style={{ background: 'var(--bg-surface-2)' }}>
                      {p.image ? <img src={p.image} className="w-9 h-9 rounded-lg object-cover"/> : '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.category}</div>
                    </div>
                    <Badge status={p.approvalStatus}>{p.approvalStatus}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Last login info */}
        {sessions.length > 0 && (
          <Card className="mt-5">
            <h2 className="font-display font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Recent Sessions</h2>
            <div className="space-y-2">
              {sessions.slice(0,3).map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className={`badge ${s.sessionStatus === 'active' ? 'badge-active' : 'badge-pending'}`}>{s.sessionStatus}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{new Date(s.loginTime).toLocaleString()}</span>
                  <span className="text-xs truncate flex-1" style={{ color: 'var(--text-muted)' }}>{s.deviceInfo?.substring(0,60)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

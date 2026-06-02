import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FiUsers, FiFileText, FiClock, FiShield, FiCheck, FiX, FiActivity } from 'react-icons/fi';
import { adminAPI } from '../../utils/api';
import { PageHeader, StatCard, Card, Badge, Avatar, Skeleton, Button } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data);
    } catch { toast.error('Failed to load dashboard.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approvePost(id);
      toast.success('Post approved!');
      window.dispatchEvent(new Event('pending-posts-updated'));
      load();
    } catch { toast.error('Failed.'); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (reason === null) return;
    try {
      await adminAPI.rejectPost(id, { reason });
      toast.success('Post rejected.');
      window.dispatchEvent(new Event('pending-posts-updated'));
      load();
    } catch { toast.error('Failed.'); }
  };

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and controls">
        <span className="badge badge-admin flex items-center gap-1.5"><FiShield size={11}/> Administrator</span>
      </PageHeader>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-28"/>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stats-grid">
              <StatCard label="Total Users"      value={data?.stats.totalUsers}    icon={FiUsers}    accent="blue"   change="Platform users"/>
              <StatCard label="Total Posts"      value={data?.stats.totalPosts}    icon={FiFileText} accent="green"  change="All posts"/>
              <StatCard label="Pending Approval" value={data?.stats.pendingPosts}  icon={FiClock}    accent="amber"  change="Needs action" changeType="down"/>
              <StatCard label="Blocked Users"    value={data?.stats.blockedUsers}  icon={FiShield}   accent="purple" change="Under review" changeType="down"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Chart */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Daily Logins (Last 7 Days)</h2>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data?.dailyStats || []}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                    <YAxis hide/>
                    <Tooltip contentStyle={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }}/>
                    <Bar dataKey="logins" fill="var(--neon)" radius={[4,4,0,0]} opacity={0.85}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Pending posts */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Pending Approvals
                    {data?.stats.pendingPosts > 0 && <span className="badge badge-pending ml-2">{data.stats.pendingPosts}</span>}
                  </h2>
                  <Link to="/admin/posts" className="btn-ghost text-xs py-1 px-2.5">View All</Link>
                </div>
                {data?.recentPosts?.filter(p => p.approvalStatus === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>All caught up! ✦</div>
                ) : (
                  <div className="space-y-2">
                    {data?.recentPosts?.filter(p => p.approvalStatus === 'pending').slice(0,4).map(p => (
                      <div key={p._id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.userId?.name} · {p.category}</div>
                        </div>
                        <button onClick={() => handleApprove(p._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                          style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--green)' }} title="Approve">
                          <FiCheck size={13}/>
                        </button>
                        <button onClick={() => handleReject(p._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }} title="Reject">
                          <FiX size={13}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Users */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Registrations</h2>
                <Link to="/admin/users" className="btn-ghost text-xs py-1 px-2.5">Manage Users</Link>
              </div>
              <div className="space-y-2">
                {data?.recentUsers?.map(u => (
                  <div key={u._id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <Avatar name={u.name} src={u.profileImage} size="sm"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    <Badge status={u.isBlocked ? 'blocked' : 'active'}>{u.isBlocked ? 'blocked' : 'active'}</Badge>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

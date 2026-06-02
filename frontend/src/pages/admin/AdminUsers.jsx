// AdminUsers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiUserX, FiUnlock, FiUser } from 'react-icons/fi';
import { adminAPI } from '../../utils/api';
import { PageHeader, Card, Badge, Avatar, Table, Tr, Td, Button, Select, Modal } from '../../components/common/UI';
import toast from 'react-hot-toast';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [blockModal, setBlockModal] = useState({ open: false, user: null });
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getAllUsers(params);
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users.'); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const doBlock = async () => {
    try {
      await adminAPI.blockUser(blockModal.user._id, { reason });
      toast.success(`${blockModal.user.name} blocked.`);
      setBlockModal({ open: false, user: null }); setReason(''); load();
    } catch { toast.error('Failed.'); }
  };

  const doUnblock = async (user) => {
    try {
      await adminAPI.unblockUser(user._id);
      toast.success(`${user.name} unblocked.`); load();
    } catch { toast.error('Failed.'); }
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${users.length} users`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}/>
            <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-8" style={{ width: 180, height: 36 }}/>
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 130, height: 36 }}>
            <option value="">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </Select>
        </div>
      </PageHeader>

      <div className="p-6">
        <Card padding={false}>
          <Table headers={['User', 'Email', 'Mobile', 'Posts', 'Joined', 'Last Login', 'Status', 'Actions']} loading={loading && users.length === 0}>
            {users.map(u => (
              <Tr key={u._id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} src={u.profileImage} size="sm"/>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                  </div>
                </Td>
                <Td>{u.email}</Td>
                <Td>{u.mobile}</Td>
                <Td>{u.postCount || 0}</Td>
                <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                <Td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}</Td>
                <Td><Badge status={u.isBlocked ? 'blocked' : 'active'}>{u.isBlocked ? 'blocked' : 'active'}</Badge></Td>
                <Td>
                  {u.isBlocked ? (
                    <button onClick={() => doUnblock(u)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>
                      <FiUnlock size={12}/> Unblock
                    </button>
                  ) : (
                    <button onClick={() => setBlockModal({ open: true, user: u })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>
                        <FiUserX size={12}/> Block
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
        </Card>
      </div>

      <Modal isOpen={blockModal.open} onClose={() => setBlockModal({ open: false, user: null })} title={`Block ${blockModal.user?.name}`}>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          This will immediately end all their sessions and prevent future logins.
        </p>
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Block Reason</label>
          <input className="input-field" value={reason} onChange={e => setReason(e.target.value)} placeholder="Policy violation, spam, etc."/>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setBlockModal({ open: false, user: null })}>Cancel</Button>
          <Button variant="danger" onClick={doBlock}>Block User</Button>
        </div>
      </Modal>
    </div>
  );
}

// ActivityLogs.jsx
import { logAPI } from '../../utils/api';
import { FiDownload, FiLogin, FiLogOut } from 'react-icons/fi';

export function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const res = await logAPI.getLogs({ ...params, limit: 50 });
        setLogs(res.data.logs);
      } catch { toast.error('Failed to load logs.'); }
      setLoading(false);
    };
    load();
  }, [statusFilter]);

  const stats = {
    total: logs.length,
    active: logs.filter(l => l.sessionStatus === 'active').length,
    expired: logs.filter(l => l.sessionStatus === 'expired').length,
    manualLogout: logs.filter(l => l.sessionStatus === 'manual_logout').length
  };

  const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '';
  const formatDuration = (loginTime, logoutTime) => {
    if (!logoutTime) return '';
    const minutes = Math.max(0, Math.round((new Date(logoutTime) - new Date(loginTime)) / 60000));
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };
  const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const downloadCsv = () => {
    const headers = ['User', 'Email', 'Login Time', 'Logout Time', 'Duration', 'IP Address', 'Device', 'Status'];
    const rows = logs.map(log => [
      log.userId?.name || 'Deleted User',
      log.userId?.email || '',
      formatDateTime(log.loginTime),
      formatDateTime(log.logoutTime),
      formatDuration(log.loginTime, log.logoutTime),
      log.ipAddress || '',
      log.deviceInfo || '',
      log.sessionStatus || ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freelancehub-access-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Activity Logs" subtitle="Login and session records">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140, height: 36 }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="manual_logout">Manual Logout</option>
          </Select>
          <Button variant="ghost" size="sm" onClick={downloadCsv} disabled={logs.length === 0}>
            <FiDownload size={13}/> Download Report
          </Button>
        </div>
      </PageHeader>

      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[['Total Logins', stats.total, 'neon'], ['Active Sessions', stats.active, 'green'], ['Expired', stats.expired, 'amber'], ['Logged Out', stats.manualLogout, 'purple']].map(([l,v,a]) => (
            <div key={l} className="surface-card p-4" style={{ borderTop: `2px solid var(--${a})` }}>
              <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{l}</div>
              <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{v}</div>
            </div>
          ))}
        </div>

        <Card padding={false}>
          <Table headers={['User', 'Email', 'Login Time', 'Logout Time', 'Duration', 'IP', 'Device', 'Status']} loading={loading && logs.length === 0}>
            {logs.map((l, i) => {
              const loginT = new Date(l.loginTime);
              const logoutT = l.logoutTime ? new Date(l.logoutTime) : null;
              const dur = logoutT ? Math.max(0, Math.round((logoutT - loginT) / 60000)) : null;

              return (
                <Tr key={i}>
                  <Td bold>{l.userId?.name || 'Deleted User'}</Td>
                  <Td>{l.userId?.email || '—'}</Td>
                  <Td>{loginT.toLocaleString()}</Td>
                  <Td>{logoutT ? logoutT.toLocaleString() : <span style={{ color: 'var(--green)' }}>Still active</span>}</Td>
                  <Td>{dur ? `${Math.floor(dur/60)}h ${dur%60}m` : '—'}</Td>
                  <Td><code style={{ fontSize: 11 }}>{l.ipAddress}</code></Td>
                  <Td><div style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{l.deviceInfo}</div></Td>
                  <Td>
                    <Badge status={l.sessionStatus === 'active' ? 'active' : l.sessionStatus === 'expired' ? 'rejected' : 'pending'}>
                      {l.sessionStatus}
                    </Badge>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        </Card>
      </div>
    </div>
  );
}

export default AdminUsers;

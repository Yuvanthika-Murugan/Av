import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';
import { adminAPI } from '../../utils/api';
import { PageHeader, Card, Badge, Avatar, Table, Tr, Td, Button, Select, Modal, Skeleton } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reviewPost, setReviewPost] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, postId: null });
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await adminAPI.getAllPosts(params);
      setPosts(res.data.posts);
      setTotal(res.data.pagination.totalPosts);
    } catch { toast.error('Failed to load posts.'); }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const openReview = (post) => {
    setReviewPost(post);
    setRejectModal({ open: false, postId: null });
  };

  const closeReview = () => setReviewPost(null);

  const approve = async (id) => {
    try {
      await adminAPI.approvePost(id);
      toast.success('Post approved!');
      window.dispatchEvent(new Event('pending-posts-updated'));
      closeReview();
      load();
    }
    catch { toast.error('Failed.'); }
  };

  const openReject = (postId) => {
    setRejectReason('');
    setRejectModal({ open: true, postId });
  };

  const reject = async () => {
    try {
      await adminAPI.rejectPost(rejectModal.postId, { reason: rejectReason });
      toast.success('Post rejected.');
      window.dispatchEvent(new Event('pending-posts-updated'));
      setRejectModal({ open: false, postId: null }); setRejectReason('');
      closeReview();
      load();
    } catch { toast.error('Failed.'); }
  };

  const del = async (id) => {
    if (!window.confirm('Permanently delete this post?')) return;
    try {
      await adminAPI.deletePost(id);
      toast.success('Post deleted.');
      window.dispatchEvent(new Event('pending-posts-updated'));
      load();
    }
    catch { toast.error('Failed.'); }
  };

  return (
    <div>
      <PageHeader title="Post Approvals" subtitle={`${total} total posts`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}/>
            <input placeholder="Search posts…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-8" style={{ width: 180, height: 36 }}/>
          </div>
          <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ width: 140, height: 36 }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </PageHeader>

      <div className="p-6">
        <Card padding={false}>
          <Table headers={['Post', 'Category', 'Author', 'Budget', 'Status', 'Created', 'Actions']} loading={loading && posts.length === 0}>
            {posts.map(p => (
              <Tr key={p._id}>
                <Td bold>
                  <div className="max-w-xs">
                    <div className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.title}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)', maxWidth: 200 }}>{p.description?.substring(0,60)}…</div>
                  </div>
                </Td>
                <Td>{p.category}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={p.userId?.name} src={p.userId?.profileImage} size="sm"/>
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.userId?.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.userId?.email}</div>
                    </div>
                  </div>
                </Td>
                <Td><span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>{p.budget}</span></Td>
                <Td><Badge status={p.approvalStatus}>{p.approvalStatus}</Badge></Td>
                <Td>{new Date(p.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    {p.approvalStatus === 'pending' && (
                      <>
                        <button onClick={() => openReview(p)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--green)' }}>
                          <FiEye size={12}/> Review & Approve
                        </button>
                        <button onClick={() => openReject(p._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>
                          <FiX size={12}/> Reject
                        </button>
                      </>
                    )}
                    {p.approvalStatus !== 'pending' && (
                      <button onClick={() => openReview(p)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--neon)' }}>
                        <FiEye size={12}/> View
                      </button>
                    )}
                    <button onClick={() => del(p._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                      style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)' }}>
                      <FiTrash2 size={13}/>
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          {/* Pagination */}
          {total > 15 && (
            <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {page} · {total} posts</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="ghost" size="sm" disabled={posts.length < 15} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!reviewPost} onClose={closeReview} title="Review User Post" maxWidth="860px">
        {reviewPost && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-5">
              <div className="rounded-2xl overflow-hidden min-h-[220px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--bg-surface-2), var(--bg-surface-3))', border: '1px solid var(--border)' }}>
                {reviewPost.image ? (
                  <img src={reviewPost.image} alt={reviewPost.title} className="w-full h-full object-cover"/>
                ) : (
                  <div className="text-6xl" aria-hidden="true">📋</div>
                )}
              </div>

              <div className="space-y-4 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={reviewPost.approvalStatus}>{reviewPost.approvalStatus}</Badge>
                  <span className="badge" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{reviewPost.category}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Submitted {new Date(reviewPost.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-2xl leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                    {reviewPost.title}
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                    {reviewPost.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="surface-card p-3">
                    <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Budget</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--green)' }}>{reviewPost.budget}</div>
                  </div>
                  <div className="surface-card p-3">
                    <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Engagement</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {reviewPost.likesCount || 0} likes · {reviewPost.commentsCount || 0} comments
                    </div>
                  </div>
                </div>

                {reviewPost.skills?.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Skills</div>
                    <div className="flex flex-wrap">
                      {reviewPost.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="surface-card p-4 flex items-center gap-3">
              <Avatar name={reviewPost.userId?.name} src={reviewPost.userId?.profileImage} size="md"/>
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {reviewPost.userId?.name || 'Unknown user'}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {reviewPost.userId?.email || 'No email available'}
                </div>
              </div>
            </div>

            {reviewPost.rejectionReason && (
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.18)' }}>
                Previous rejection reason: {reviewPost.rejectionReason}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button variant="ghost" onClick={closeReview}>Close</Button>
              {reviewPost.approvalStatus === 'pending' && (
                <>
                  <Button variant="danger" onClick={() => openReject(reviewPost._id)}><FiX size={14}/> Reject</Button>
                  <Button variant="success" onClick={() => approve(reviewPost._id)}><FiCheck size={14}/> Approve Post</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, postId: null })} title="Reject Post">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Rejection Reason</label>
            <textarea rows={3} className="input-field resize-none" value={rejectReason}
              onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this post is being rejected…"/>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectModal({ open: false, postId: null })}>Cancel</Button>
            <Button variant="danger" onClick={reject}>Reject Post</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

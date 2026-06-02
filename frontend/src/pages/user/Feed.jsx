import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { postAPI } from '../../utils/api';
import { PageHeader, PostSkeleton, EmptyState, Select } from '../../components/common/UI';
import PostCard from '../../components/user/PostCard';
import SessionBar from '../../components/user/SessionBar';

const CATEGORIES = ['All', 'Web Development', 'Mobile', 'Design', 'AI/ML', 'DevOps', 'Marketing', 'Writing', 'Data Science'];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    try {
      const params = { page: currentPage, limit: 10 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const res = await postAPI.getFeed(params);
      const newPosts = res.data.posts;

      if (reset) {
        setPosts(newPosts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(p => p + 1);
      }
      setHasMore(res.data.pagination.hasNextPage);
    } catch {}
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    load(true);
  }, [search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <PageHeader title="Freelancer Feed" subtitle="Browse approved talent posts">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}/>
            <input placeholder="Search posts…" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="input-field pl-8" style={{ width: 200, height: 36 }}/>
          </div>
          <Select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 150, height: 36 }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Select>
        </form>
      </PageHeader>

      <div className="p-6">
        <SessionBar/>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 feed-grid">
            {[...Array(6)].map((_,i) => <PostSkeleton key={i}/>)}
          </div>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={() => load(false)}
            hasMore={hasMore}
            loader={<div className="col-span-2 text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading more posts...</div>}
            endMessage={posts.length > 0 && <div className="col-span-2 text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>You've seen all posts ✦</div>}
            scrollableTarget="feedContainer">
            {posts.length === 0 ? (
              <EmptyState icon="📭" title="No posts found" description={search ? `No results for "${search}"` : 'No approved posts yet.'}/>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 feed-grid">
                {posts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i}/>
                ))}
              </div>
            )}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}

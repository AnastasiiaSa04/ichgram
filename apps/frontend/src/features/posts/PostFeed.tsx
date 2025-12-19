import { useState, useEffect, useCallback, useRef } from 'react';
import type { PostWithUser } from '@ichgram/shared-types';
import { useGetFeedQuery } from './postsApi';
import { PostCard } from './PostCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { POSTS_PER_PAGE } from '@/lib/constants';

export function PostFeed() {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostWithUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastTotal = useRef<number | null>(null);

  const { data, isLoading, isFetching } = useGetFeedQuery({ page, limit: POSTS_PER_PAGE });

  useEffect(() => {
    if (data?.data?.posts) {
      const currentTotal = data.data.total;
      const totalChanged = lastTotal.current !== null && currentTotal !== lastTotal.current;
      
      if (totalChanged && page !== 1) {
        lastTotal.current = currentTotal;
        setAllPosts([]);
        setPage(1);
        return;
      }
      
      if (page === 1) {
        setAllPosts(data.data.posts);
      } else {
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const newPosts = data.data.posts.filter((p) => !existingIds.has(p._id));
          return [...prev, ...newPosts];
        });
      }
      
      lastTotal.current = currentTotal;
      setTotalPages(data.data.pages);
    }
  }, [data, page]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, page, totalPages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore]);

  if (isLoading && allPosts.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasMore = page < totalPages;

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {isFetching && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}

      {!hasMore && allPosts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">You&apos;ve seen all the updates</p>
          <p className="text-xs mt-1">You have viewed all new publications for the last 3 days</p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-4" />
    </div>
  );
}

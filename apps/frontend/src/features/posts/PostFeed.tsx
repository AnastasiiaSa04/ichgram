import { useState, useEffect, useCallback, useRef } from 'react';
import type { PostWithUser } from '@ichgram/shared-types';
import { useGetFeedQuery } from './postsApi';
import { PostCard } from './PostCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { POSTS_PER_PAGE } from '@/lib/constants';

export function PostFeed() {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostWithUser[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGetFeedQuery({ page, limit: POSTS_PER_PAGE });

  useEffect(() => {
    if (data?.data?.posts) {
      setAllPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newPosts = data.data.posts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...newPosts];
      });
    }
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && data?.data && page < data.data.pages) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, data, page]);

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

  const hasMore = data?.data ? page < data.data.pages : false;

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

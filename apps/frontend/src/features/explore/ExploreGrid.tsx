import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import type { PostWithUser } from '@ichgram/shared-types';
import { useGetExplorePostsQuery } from './exploreApi';
import { PostDetailModal } from '@/features/posts/PostDetailModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getImageUrl, formatNumber } from '@/lib/utils';

export function ExploreGrid() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostWithUser[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGetExplorePostsQuery({ page, limit: 30 });

  useEffect(() => {
    if (data?.data?.data) {
      setAllPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newPosts = data.data.data.filter((p) => !existingIds.has(p._id));
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

  const posts = allPosts;

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>No posts to explore yet.</p>
      </div>
    );
  }

  const hasMore = data?.data ? page < data.data.pages : false;

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post, index) => {
          const isLarge = index % 10 === 2 || index % 10 === 5;

          return (
            <button
              key={post._id}
              onClick={() => setSelectedPostId(post._id)}
              className={`relative group ${isLarge ? 'row-span-2' : ''}`}
            >
              <div className={isLarge ? 'h-full' : 'aspect-square'}>
                <img
                  src={getImageUrl(post.images[0])}
                  alt={post.caption || 'Post'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                <div className="flex items-center gap-1">
                  <Heart className="h-5 w-5 fill-white" />
                  <span className="font-semibold">{formatNumber(post.likesCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-5 w-5 fill-white" />
                  <span className="font-semibold">{formatNumber(post.commentsCount)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isFetching && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">You&apos;ve explored all posts</p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-4" />

      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          open={!!selectedPostId}
          onOpenChange={(open) => !open && setSelectedPostId(null)}
        />
      )}
    </>
  );
}

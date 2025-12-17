import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useGetExplorePostsQuery } from './exploreApi';
import { PostDetailModal } from '@/features/posts/PostDetailModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getImageUrl, formatNumber } from '@/lib/utils';

export function ExploreGrid() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { data, isLoading } = useGetExplorePostsQuery({ limit: 30 });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const posts = data?.data?.data || [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>No posts to explore yet.</p>
      </div>
    );
  }

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

      {/* Post Detail Modal */}
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


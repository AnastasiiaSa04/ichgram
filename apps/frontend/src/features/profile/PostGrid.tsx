import { useState } from 'react';
import { Grid, Heart, MessageCircle } from 'lucide-react';
import { useGetUserPostsQuery } from '@/features/posts/postsApi';
import { PostDetailModal } from '@/features/posts/PostDetailModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getImageUrl, formatNumber } from '@/lib/utils';

interface PostGridProps {
  userId: string;
}

export function PostGrid({ userId }: PostGridProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { data, isLoading } = useGetUserPostsQuery({ userId, limit: 12 });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const posts = data?.data?.posts || [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto border-2 border-foreground rounded-full flex items-center justify-center mb-4">
          <Grid className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Posts Yet</h3>
        <p className="text-muted-foreground">When posts are shared, they will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="border-t border-border">
        <div className="flex justify-center">
          <button className="flex items-center gap-1 px-4 py-4 border-t border-foreground -mt-px text-sm font-semibold uppercase tracking-wider">
            <Grid className="h-3 w-3" />
            Posts
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <button
            key={post._id}
            onClick={() => setSelectedPostId(post._id)}
            className="aspect-square relative group"
          >
            <img
              src={getImageUrl(post.images[0])}
              alt={post.caption || 'Post'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
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
        ))}
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

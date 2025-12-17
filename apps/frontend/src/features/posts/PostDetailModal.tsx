import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGetPostQuery } from './postsApi';
import { useGetCommentsQuery, useAddCommentMutation } from './commentsApi';
import { useLikePostMutation, useUnlikePostMutation } from './likesApi';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, getImageUrl, formatNumber, cn } from '@/lib/utils';

interface PostDetailModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailModal({ postId, open, onOpenChange }: PostDetailModalProps) {
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { data: postData, isLoading: isLoadingPost } = useGetPostQuery(postId, { skip: !open });
  const { data: commentsData, isLoading: isLoadingComments } = useGetCommentsQuery(
    { postId },
    { skip: !open }
  );

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  const post = postData?.data?.post;
  const comments = commentsData?.data?.data || [];

  useEffect(() => {
    if (post) {
      setIsLiked(post.isLiked || false);
      setLikesCount(post.likesCount);
    }
  }, [post]);

  const handleLike = async () => {
    if (!post) return;
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    try {
      if (wasLiked) {
        await unlikePost(post._id).unwrap();
      } else {
        await likePost(post._id).unwrap();
      }
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 409) {
        try {
          await unlikePost(post._id).unwrap();
          setIsLiked(false);
          setLikesCount((prev) => prev - 1);
          return;
        } catch {
          // Ignore
        }
      }
      setIsLiked(wasLiked);
      setLikesCount(post.likesCount);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addComment({ postId, text: comment }).unwrap();
      setComment('');
    } catch {
      // Handle error
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 overflow-hidden">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
          <X className="h-6 w-6 text-white" />
        </DialogClose>

        {isLoadingPost || !post ? (
          <div className="flex items-center justify-center h-[600px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="flex h-[600px]">
            {/* Image */}
            <div className="w-[500px] flex-shrink-0">
              <img
                src={getImageUrl(post.images[0])}
                alt={post.caption || 'Post'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="w-[400px] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Link to={ROUTES.PROFILE(post.author.username)}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getImageUrl(post.author.avatar)} />
                      <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link
                    to={ROUTES.PROFILE(post.author.username)}
                    className="font-semibold text-sm hover:opacity-70"
                  >
                    {post.author.username}
                  </Link>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Caption */}
                {post.caption && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getImageUrl(post.author.avatar)} />
                      <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <Link to={ROUTES.PROFILE(post.author.username)} className="font-semibold mr-1">
                          {post.author.username}
                        </Link>
                        {post.caption}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(post.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                {isLoadingComments ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <Link to={ROUTES.PROFILE(c.userId.username)}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getImageUrl(c.userId.avatar)} />
                          <AvatarFallback>{c.userId.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <p className="text-sm">
                          <Link to={ROUTES.PROFILE(c.userId.username)} className="font-semibold mr-1">
                            {c.userId.username}
                          </Link>
                          {c.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(c.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={handleLike}
                    className="hover:opacity-70"
                    aria-label={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      className={cn(
                        'h-6 w-6',
                        isLiked && 'fill-red-500 text-red-500'
                      )}
                    />
                  </button>
                </div>
                <p className="font-semibold text-sm mb-1">
                  {formatNumber(likesCount)} likes
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>

              {/* Comment input */}
              <form
                onSubmit={handleAddComment}
                className="flex items-center gap-2 p-4 border-t border-border"
              >
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-instagram-blue font-semibold p-0 h-auto hover:bg-transparent"
                  disabled={!comment.trim() || isAddingComment}
                >
                  Post
                </Button>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


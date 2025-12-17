import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import type { PostWithUser } from '@ichgram/shared-types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToggleLikeMutation } from './likesApi';
import { useAddCommentMutation } from './commentsApi';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { setActivePost } from '@/features/ui/uiSlice';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, getImageUrl, formatNumber, cn } from '@/lib/utils';
import { FollowButton } from '@/features/profile/FollowButton';
import { PostDetailModal } from './PostDetailModal';

interface PostCardProps {
  post: PostWithUser;
}

export function PostCard({ post }: PostCardProps) {
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showModal, setShowModal] = useState(false);

  const { user: currentUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [toggleLike] = useToggleLikeMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  const isOwnPost = currentUser?._id === post.userId._id;

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      await toggleLike(post._id).unwrap();
    } catch {
      setIsLiked(isLiked);
      setLikesCount(post.likesCount);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addComment({ postId: post._id, text: comment }).unwrap();
      setComment('');
    } catch {
      // Handle error
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const handleOpenModal = () => {
    dispatch(setActivePost(post._id));
    setShowModal(true);
  };

  return (
    <>
      <article className="bg-background border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.PROFILE(post.userId.username)}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={getImageUrl(post.userId.avatar)} alt={post.userId.username} />
                <AvatarFallback>{post.userId.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                to={ROUTES.PROFILE(post.userId.username)}
                className="font-semibold text-sm hover:opacity-70"
              >
                {post.userId.username}
              </Link>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm">
                {formatRelativeTime(post.createdAt)}
              </span>
              {!isOwnPost && (
                <>
                  <span className="text-muted-foreground text-sm">•</span>
                  <FollowButton userId={post.userId._id} variant="link" />
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Image */}
        <div className="relative aspect-square" onDoubleClick={handleDoubleTap}>
          <img
            src={getImageUrl(post.imageUrl)}
            alt={post.caption || 'Post'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Actions */}
        <div className="p-3">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={handleLike}
              className="hover:opacity-70 transition-opacity"
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart
                className={cn(
                  'h-6 w-6 transition-colors',
                  isLiked && 'fill-red-500 text-red-500 animate-heart-beat'
                )}
              />
            </button>
            <button
              onClick={handleOpenModal}
              className="hover:opacity-70 transition-opacity"
              aria-label="Comment"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Likes */}
          <p className="font-semibold text-sm mb-1">{formatNumber(likesCount)} likes</p>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm">
              <Link to={ROUTES.PROFILE(post.userId.username)} className="font-semibold mr-1">
                {post.userId.username}
              </Link>
              {post.caption}
            </p>
          )}

          {/* View comments */}
          {post.commentsCount > 0 && (
            <button
              onClick={handleOpenModal}
              className="text-sm text-muted-foreground mt-1 hover:text-foreground"
            >
              View all {post.commentsCount} comments
            </button>
          )}

          {/* Add comment */}
          <form onSubmit={handleAddComment} className="flex items-center mt-3 pt-3 border-t border-border">
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
      </article>

      <PostDetailModal
        postId={post._id}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFollowMutation, useUnfollowMutation, useCheckFollowStatusQuery } from './followsApi';
import { useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  variant?: 'default' | 'link' | 'outline';
  className?: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({ userId, variant = 'default', className, initialIsFollowing }: FollowButtonProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { data: statusData } = useCheckFollowStatusQuery(userId, { skip: initialIsFollowing !== undefined });
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? statusData?.data?.isFollowing ?? false);

  const [follow, { isLoading: isFollowing_ }] = useFollowMutation();
  const [unfollow, { isLoading: isUnfollowing }] = useUnfollowMutation();

  // Don't show follow button for own profile
  if (user?._id === userId) {
    return null;
  }

  const handleClick = async () => {
    try {
      if (isFollowing) {
        await unfollow(userId).unwrap();
        setIsFollowing(false);
      } else {
        await follow(userId).unwrap();
        setIsFollowing(true);
      }
    } catch {
      // Handle error - revert optimistic update
    }
  };

  const isLoading = isFollowing_ || isUnfollowing;

  if (variant === 'link') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'text-sm font-semibold transition-colors',
          isFollowing
            ? 'text-foreground hover:text-muted-foreground'
            : 'text-instagram-blue hover:text-instagram-blue-hover',
          className
        )}
      >
        {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={isFollowing ? 'secondary' : 'default'}
      size="sm"
      className={className}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}


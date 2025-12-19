import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import type { UserProfile } from '@ichgram/shared-types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FollowButton } from './FollowButton';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/lib/constants';
import { getImageUrl, formatNumber } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const isOwnProfile = user?._id === profile._id;

  return (
    <div className="flex gap-20 mb-12 pt-8">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="w-36 h-36">
          <AvatarImage src={getImageUrl(profile.avatar)} alt={profile.username} />
          <AvatarFallback className="text-4xl">
            {profile.username?.[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Info */}
      <div className="flex-1">
        {/* Username and actions */}
        <div className="flex items-center gap-4 mb-5">
          <h1 className="text-xl">{profile.username}</h1>
          {isOwnProfile ? (
            <>
              <Link to={ROUTES.EDIT_PROFILE}>
                <Button variant="secondary" size="sm">
                  Edit profile
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <FollowButton userId={profile._id} initialIsFollowing={profile.isFollowing} />
              <Link to={`${ROUTES.MESSAGES}?user=${profile._id}`}>
                <Button variant="secondary" size="sm">
                  Message
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-10 mb-5">
          <div>
            <span className="font-semibold">{formatNumber(profile.postsCount)}</span>{' '}
            <span className="text-muted-foreground">posts</span>
          </div>
          <button className="hover:opacity-70">
            <span className="font-semibold">{formatNumber(profile.followersCount)}</span>{' '}
            <span className="text-muted-foreground">followers</span>
          </button>
          <button className="hover:opacity-70">
            <span className="font-semibold">{formatNumber(profile.followingCount)}</span>{' '}
            <span className="text-muted-foreground">following</span>
          </button>
        </div>

        {/* Bio */}
        <div>
          {profile.fullName && <p className="font-semibold">{profile.fullName}</p>}
          {profile.bio && <p className="whitespace-pre-wrap">{profile.bio}</p>}
        </div>
      </div>
    </div>
  );
}

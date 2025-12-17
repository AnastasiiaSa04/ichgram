import { useParams } from 'react-router-dom';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { PostGrid } from '@/features/profile/PostGrid';
import { useGetUserProfileQuery } from '@/features/users/usersApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, error } = useGetUserProfileQuery(username!, {
    skip: !username,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data?.data?.user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-muted-foreground">
          The user you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const profile = data.data.user;

  return (
    <div className="max-w-[935px] mx-auto">
      <ProfileHeader profile={profile} />
      <PostGrid userId={profile._id} />
    </div>
  );
}


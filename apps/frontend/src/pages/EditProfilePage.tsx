import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useUpdateProfileMutation } from '@/features/users/usersApi';
import { updateUser } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/useToast';
import { getImageUrl } from '@/lib/utils';
import { User } from 'lucide-react';
import { AvatarUpload } from '@/features/profile/AvatarUpload';

const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores'),
  bio: z.string().max(150, 'Bio must be at most 150 characters').optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      username: user?.username || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      const result = await updateProfile(data).unwrap();
      if (result.success) {
        dispatch(updateUser(result.data));
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as { data?: { message?: string } })?.data?.message || 'Something went wrong',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-[600px] mx-auto py-8">
      <h1 className="text-xl font-semibold mb-8">Edit profile</h1>

      <div className="bg-gray-50 rounded-xl p-4 mb-8 flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={getImageUrl(user.avatar)} alt={user.username} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{user.username}</p>
          <p className="text-sm text-muted-foreground">{user.fullName}</p>
        </div>
        <AvatarUpload />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="fullName" className="font-semibold mb-2 block">
            Full Name
          </Label>
          <Input
            id="fullName"
            {...register('fullName')}
            className="bg-gray-50"
          />
          {errors.fullName && (
            <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="username" className="font-semibold mb-2 block">
            Username
          </Label>
          <Input
            id="username"
            {...register('username')}
            className="bg-gray-50"
          />
          {errors.username && (
            <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bio" className="font-semibold mb-2 block">
            Bio
          </Label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={3}
            className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          {errors.bio && (
            <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
}


import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useUpdateProfileMutation } from '@/features/users/usersApi';
import { updateUser } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/useToast';
import { getImageUrl } from '@/lib/utils';
import { User } from 'lucide-react';
import { AvatarUpload } from '@/features/profile/AvatarUpload';

const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
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
    control,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: user?.username || '',
      website: user?.website || '',
      bio: user?.bio || '',
    },
  });

  const bioValue = useWatch({ control, name: 'bio' }) || '';

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
    <div className="max-w-[610px] mx-auto py-[60px] px-4">
      <h1 className="text-xl font-bold mb-8">Edit profile</h1>

      <div className="bg-[#efefef] rounded-[20px] p-4 mb-8 flex items-center gap-4">
        <Avatar className="h-14 w-14 border border-black/10">
          <AvatarImage src={getImageUrl(user.avatar)} alt={user.username} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold">{user.username}</p>
          <p className="text-sm text-[#737373] truncate">{user.bio || user.fullName}</p>
        </div>
        <AvatarUpload />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="username" className="font-bold text-base mb-2 block">
            Username
          </label>
          <Input
            id="username"
            {...register('username')}
            className="bg-white border-[#dbdbdb] rounded-[12px] h-10"
          />
          {errors.username && (
            <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="font-bold text-base mb-2 block">
            Website
          </label>
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              id="website"
              {...register('website')}
              placeholder="https://"
              className="bg-white border-[#dbdbdb] rounded-[12px] h-10 pl-9"
            />
          </div>
          {errors.website && (
            <p className="text-xs text-destructive mt-1">{errors.website.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="font-bold text-base mb-2 block">
            About
          </label>
          <div className="relative">
            <textarea
              id="bio"
              {...register('bio')}
              rows={3}
              maxLength={150}
              className="flex w-full rounded-[12px] border border-[#dbdfe4] bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none pr-16"
            />
            <span className="absolute bottom-3 right-4 text-xs text-[#737373]">
              {bioValue.length} / 150
            </span>
          </div>
          {errors.bio && (
            <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="w-[268px] h-8 rounded-[8px] bg-[#0095f6] hover:bg-[#1877f2] font-semibold"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </div>
  );
}

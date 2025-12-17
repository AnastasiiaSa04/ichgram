import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useUpdateAvatarMutation } from '@/features/users/usersApi';
import { useAppDispatch } from '@/app/hooks';
import { updateUser } from '@/features/auth/authSlice';
import { toast } from '@/hooks/useToast';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

export function AvatarUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [updateAvatar, { isLoading }] = useUpdateAvatarMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, or WebP image',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
      });
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const result = await updateAvatar(formData).unwrap();
      if (result.success) {
        dispatch(updateUser(result.data));
        toast({
          title: 'Avatar updated',
          description: 'Your avatar has been updated successfully',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update avatar',
      });
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        size="sm"
      >
        {isLoading ? 'Uploading...' : 'Change photo'}
      </Button>
    </>
  );
}


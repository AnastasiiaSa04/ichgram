import { useState, useRef, useCallback } from 'react';
import { ImagePlus, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeCreatePostModal } from '@/features/ui/uiSlice';
import { useCreatePostMutation } from './postsApi';
import { toast } from '@/hooks/useToast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

type Step = 'select' | 'caption';

export function CreatePostModal({ open }: { open: boolean }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<Step>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createPost, { isLoading }] = useCreatePostMutation();

  const handleClose = useCallback(() => {
    dispatch(closeCreatePostModal());
    setStep('select');
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
  }, [dispatch]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setStep('caption');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const fakeEvent = {
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(fakeEvent);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    if (caption.trim()) {
      formData.append('caption', caption.trim());
    }

    try {
      await createPost(formData).unwrap();
      toast({
        title: 'Post created',
        description: 'Your post has been shared successfully',
      });
      handleClose();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create post',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            {step === 'caption' && (
              <button onClick={() => setStep('select')} className="hover:opacity-70">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <DialogTitle className="flex-1 text-center font-semibold">Create new post</DialogTitle>
            {step === 'caption' && (
              <Button
                variant="ghost"
                className="text-instagram-blue font-semibold p-0 h-auto"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Sharing...' : 'Share'}
              </Button>
            )}
          </div>
        </DialogHeader>

        {step === 'select' ? (
          <div
            className="flex flex-col items-center justify-center p-10 min-h-[400px]"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <ImagePlus className="h-20 w-20 mb-4 text-muted-foreground" />
            <p className="text-xl font-light mb-4">Drag photos here</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>Select from computer</Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {preview && (
              <div className="aspect-square relative">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4 border-t border-border">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getImageUrl(user?.avatar)} alt={user?.username} />
                  <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  maxLength={2200}
                  className="flex-1 resize-none outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground text-right mt-2">
                {caption.length}/2,200
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

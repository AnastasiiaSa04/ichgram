import { useState, useCallback } from 'react';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

interface UseImageUploadOptions {
  maxSize?: number;
  acceptedTypes?: string[];
  onError?: (message: string) => void;
}

interface UseImageUploadReturn {
  file: File | null;
  preview: string | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  selectFile: (file: File) => void;
  clearFile: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useImageUpload({
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_IMAGE_TYPES,
  onError,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (f: File): boolean => {
      if (!acceptedTypes.includes(f.type)) {
        const message = 'Invalid file type. Please select a JPEG, PNG, or WebP image.';
        setError(message);
        onError?.(message);
        return false;
      }

      if (f.size > maxSize) {
        const message = `File too large. Please select an image smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`;
        setError(message);
        onError?.(message);
        return false;
      }

      return true;
    },
    [acceptedTypes, maxSize, onError]
  );

  const selectFile = useCallback(
    (f: File) => {
      setError(null);

      if (!validateFile(f)) {
        return;
      }

      setIsLoading(true);
      setFile(f);

      // Create preview
      const reader = new FileReader();
      reader.onloadstart = () => setProgress(0);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsLoading(false);
        setProgress(100);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };
      reader.readAsDataURL(f);
    },
    [validateFile]
  );

  const clearFile = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
  }, [preview]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        selectFile(droppedFile);
      }
    },
    [selectFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        selectFile(selectedFile);
      }
    },
    [selectFile]
  );

  return {
    file,
    preview,
    isLoading,
    progress,
    error,
    selectFile,
    clearFile,
    handleDrop,
    handleFileChange,
  };
}

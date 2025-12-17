import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/constants';
import { toast } from '@/hooks/useToast';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      await resetPassword(data).unwrap();
      setEmailSent(true);
      toast({
        title: 'Email sent',
        description: 'Check your email for password reset instructions',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as { data?: { message?: string } })?.data?.message || 'Something went wrong',
      });
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-[350px]">
        <div className="bg-white border border-border rounded-sm p-10 text-center">
          <div className="w-24 h-24 mx-auto border-2 border-foreground rounded-full flex items-center justify-center mb-4">
            <Lock className="h-12 w-12" />
          </div>
          <h2 className="font-semibold mb-2">Email Sent</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We sent an email to {getValues('email')} with a link to reset your password.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button variant="link" className="text-instagram-blue">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[350px]">
      <div className="bg-white border border-border rounded-sm p-10 mb-3">
        <div className="w-24 h-24 mx-auto border-2 border-foreground rounded-full flex items-center justify-center mb-4">
          <Lock className="h-12 w-12" />
        </div>
        
        <h2 className="font-semibold text-center mb-2">Trouble logging in?</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Enter your email and we'll send you a link to get back into your account.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              {...register('email')}
              className="bg-gray-50 border-gray-200 text-sm h-9"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send login link'}
          </Button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-border" />
          <span className="px-4 text-sm text-muted-foreground font-semibold">OR</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <Link
          to={ROUTES.SIGNUP}
          className="block text-center text-sm font-semibold hover:opacity-70"
        >
          Create new account
        </Link>
      </div>

      <div className="bg-white border border-border rounded-sm p-5 text-center text-sm">
        <Link to={ROUTES.LOGIN} className="font-semibold hover:opacity-70">
          Back to login
        </Link>
      </div>
    </div>
  );
}


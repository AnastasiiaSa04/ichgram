import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/Logo';
import { ROUTES } from '@/lib/constants';
import { toast } from '@/hooks/useToast';

const resetSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
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
      await resetPassword({ email: data.emailOrUsername }).unwrap();
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
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 h-[60px] flex items-center px-11">
          <Link to={ROUTES.HOME}>
            <Logo />
          </Link>
        </header>
        <div className="flex justify-center pt-11">
          <div className="bg-white border border-gray-200 rounded-[3px] w-[390px] text-center">
            <div className="p-10">
              <img
                src="/lock-icon.svg"
                alt="Lock"
                className="w-24 h-24 mx-auto mb-4"
              />
              <h2 className="font-semibold text-base mb-2">Email Sent</h2>
              <p className="text-sm text-gray-500 mb-4 leading-[18px]">
                We sent an email to {getValues('emailOrUsername')} with a link to reset your password.
              </p>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 py-3">
              <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-gray-800">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 h-[60px] flex items-center px-11">
        <Link to={ROUTES.HOME}>
          <Logo />
        </Link>
      </header>
      <div className="flex justify-center pt-11">
        <div className="bg-white border border-gray-200 rounded-[3px] w-[390px]">
          <div className="px-11 pt-6 pb-0">
            <img
              src="/lock-icon.svg"
              alt="Lock"
              className="w-24 h-24 mx-auto"
            />
            <h2 className="font-semibold text-base text-center mt-3">
              Trouble logging in?
            </h2>
            <p className="text-sm text-gray-500 text-center mt-4 leading-[18px]">
              Enter your email, phone, or username and we'll send you a link to get back into your account.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Email or Username"
                  {...register('emailOrUsername')}
                  className="bg-gray-50 border-gray-200 h-10 rounded-md"
                />
                {errors.emailOrUsername && (
                  <p className="text-xs text-red-500 mt-1">{errors.emailOrUsername.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-8 rounded-lg text-sm font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Reset your password'}
              </Button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-gray-500 text-[13px] font-semibold uppercase">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <Link
              to={ROUTES.SIGNUP}
              className="block text-center text-sm font-semibold text-gray-800 mb-10"
            >
              Create new account
            </Link>
          </div>

          <div className="bg-gray-50 border-t border-gray-200 py-3 text-center">
            <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-gray-800">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

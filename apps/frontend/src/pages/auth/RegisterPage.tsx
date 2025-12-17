import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/Logo';
import { ROUTES } from '@/lib/constants';
import { toast } from '@/hooks/useToast';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerUser(data).unwrap();
      if (result.success) {
        dispatch(
          setCredentials({
            user: result.data.user,
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          })
        );
        navigate(ROUTES.HOME, { replace: true });
      }
    } catch (error) {
      const apiError = error as { data?: { message?: string; errors?: Array<{ field: string; message: string }> } };
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: apiError?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center">
        <div className="bg-white border border-[#dbdbdb] rounded-[1px] p-10 mb-3 w-[350px]">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="text-center text-[#737373] font-semibold text-base mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[6px]">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register('email')}
                className="bg-[#fafafa] border-[#dbdbdb] text-xs h-[38px] rounded-[3px]"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Input
                id="fullName"
                type="text"
                placeholder="Full Name"
                {...register('fullName')}
                className="bg-[#fafafa] border-[#dbdbdb] text-xs h-[38px] rounded-[3px]"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                {...register('username')}
                className="bg-[#fafafa] border-[#dbdbdb] text-xs h-[38px] rounded-[3px]"
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password')}
                className="bg-[#fafafa] border-[#dbdbdb] text-xs h-[38px] rounded-[3px] pr-14"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
              <button
                type="button"
                className="absolute right-3 top-[19px] -translate-y-1/2 text-sm font-semibold text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="text-xs text-[#737373] text-center pt-4 pb-2 leading-4">
              <p>
                People who use our service may have uploaded your contact information to Instagram.{' '}
                <a href="#" className="text-[#00376b]">Learn More</a>
              </p>
              <p className="mt-3">
                By signing up, you agree to our{' '}
                <a href="#" className="text-[#00376b]">Terms</a>
                {' '},{' '}
                <a href="#" className="text-[#00376b]">Privacy Policy</a>
                {' '}and{' '}
                <a href="#" className="text-[#00376b]">Cookies Policy</a>
                {' '}.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-8 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </form>
        </div>

        <div className="bg-white border border-[#dbdbdb] rounded-[1px] p-5 w-[350px] text-center">
          <p className="text-sm">
            Have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-[#0095f6] font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

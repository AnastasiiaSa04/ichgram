import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { ROUTES } from '@/lib/constants';
import { toast } from '@/hooks/useToast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      if (result.success) {
        dispatch(
          setCredentials({
            user: result.data.user,
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          })
        );
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: (error as { data?: { message?: string } })?.data?.message || 'Invalid credentials',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
      <div className="flex items-center gap-8 max-w-[935px] w-full px-4">
        <div className="hidden lg:block w-[380px] h-[580px] flex-shrink-0">
          <img
            src="/phones.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="w-[350px] flex-shrink-0">
          <div className="bg-white border border-[#dbdbdb] rounded-[1px] px-10 pt-9 pb-5 mb-[10px]">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[6px]">
              <div>
                <Label htmlFor="email" className="sr-only">
                  Username, or email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Username, or email"
                  {...register('email')}
                  className="bg-[#fafafa] border-[#dbdbdb] text-xs h-[38px] rounded-[3px] placeholder:text-[#737373]"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  {...register('password')}
                  className="bg-[#fafafa] border-[#dbdbdb] text-xs h-[38px] rounded-[3px] pr-14 placeholder:text-[#737373]"
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#262626]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  className="w-full h-8 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </Button>
              </div>
            </form>

            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-[#dbdbdb]" />
              <span className="px-4 text-[13px] text-[#737373] font-semibold uppercase">or</span>
              <div className="flex-1 h-px bg-[#dbdbdb]" />
            </div>

            <Link
              to={ROUTES.RESET_PASSWORD}
              className="block text-center text-xs text-[#00376b]"
            >
              Forgot password?
            </Link>
          </div>

          <div className="bg-white border border-[#dbdbdb] rounded-[1px] h-[63px] flex items-center justify-center text-sm">
            <span className="text-[#262626]">Don't have an account?</span>
            <Link to={ROUTES.SIGNUP} className="text-[#0095f6] font-semibold ml-1">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

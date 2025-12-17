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
    <div className="w-full max-w-[350px]">
      <div className="bg-white border border-border rounded-sm p-10 mb-3">
        <h1 className="text-4xl font-serif italic text-center mb-10">Ichgram</h1>
        
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
          
          <div className="relative">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register('password')}
              className="bg-gray-50 border-gray-200 text-sm h-9 pr-16"
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-border" />
          <span className="px-4 text-sm text-muted-foreground font-semibold">OR</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <Link
          to={ROUTES.RESET_PASSWORD}
          className="block text-center text-xs text-instagram-blue hover:text-instagram-blue-hover"
        >
          Forgot password?
        </Link>
      </div>

      <div className="bg-white border border-border rounded-sm p-5 text-center text-sm">
        Don't have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="text-instagram-blue font-semibold hover:text-instagram-blue-hover">
          Sign up
        </Link>
      </div>
    </div>
  );
}


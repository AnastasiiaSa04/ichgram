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
import { Label } from '@/components/ui/label';
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
    <div className="w-full max-w-[350px]">
      <div className="bg-white border border-border rounded-sm p-10 mb-3">
        <div className="text-center mb-3">
          <Logo className="text-4xl" />
        </div>
        <p className="text-center text-muted-foreground font-semibold mb-5">
          Sign up to see photos and videos from your friends.
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

          <div>
            <Label htmlFor="fullName" className="sr-only">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Full Name"
              {...register('fullName')}
              className="bg-gray-50 border-gray-200 text-sm h-9"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="username" className="sr-only">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              {...register('username')}
              className="bg-gray-50 border-gray-200 text-sm h-9"
            />
            {errors.username && (
              <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
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

          <p className="text-xs text-muted-foreground text-center pt-3">
            People who use our service may have uploaded your contact information to Ichgram.
          </p>

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>
      </div>

      <div className="bg-white border border-border rounded-sm p-5 text-center text-sm">
        Have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-instagram-blue font-semibold hover:text-instagram-blue-hover">
          Log in
        </Link>
      </div>
    </div>
  );
}


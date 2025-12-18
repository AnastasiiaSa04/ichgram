import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-2xl font-semibold mb-4">Sorry, this page isn't available.</h1>
      <p className="text-muted-foreground mb-6">
        The link you followed may be broken, or the page may have been removed.
      </p>
      <Link
        to={ROUTES.HOME}
        className="text-instagram-blue hover:text-instagram-blue-hover font-medium"
      >
        Go back to Ichgram.
      </Link>
    </div>
  );
}



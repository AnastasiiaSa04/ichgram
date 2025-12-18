import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLazySearchUsersQuery } from '@/features/users/usersApi';
import { useAppDispatch } from '@/app/hooks';
import { setSearchPanelOpen } from '@/features/ui/uiSlice';
import { ROUTES } from '@/lib/constants';
import { getImageUrl, debounce, cn } from '@/lib/utils';

interface SearchPanelProps {
  isOpen: boolean;
}

export function SearchPanel({ isOpen }: SearchPanelProps) {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [searchUsers, { data, isLoading, isFetching }] = useLazySearchUsersQuery();

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim().length >= 2) {
        searchUsers({ query: searchQuery });
      }
    }, 300),
    [searchUsers]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClose = () => {
    dispatch(setSearchPanelOpen(false));
  };

  const handleUserClick = () => {
    dispatch(setSearchPanelOpen(false));
    setQuery('');
  };

  const users = data?.data?.data || [];

  return (
    <div
      className={cn(
        'fixed left-[72px] top-0 h-full w-[400px] bg-background border-r border-border shadow-xl z-40 transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Search</h2>
            <button onClick={handleClose} className="hover:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-0"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted-foreground text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {(isLoading || isFetching) && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {!isLoading && !isFetching && query.length >= 2 && users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No results found.
            </div>
          )}

          {!isLoading && !isFetching && users.length > 0 && (
            <div className="py-2">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={ROUTES.PROFILE(user.username)}
                  onClick={handleUserClick}
                  className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={getImageUrl(user.avatar)} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user.username}</p>
                    {user.fullName && (
                      <p className="text-sm text-muted-foreground">{user.fullName}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!query && (
            <div className="px-6 py-4">
              <h3 className="font-semibold mb-4">Recent</h3>
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent searches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



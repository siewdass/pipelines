import { useNavigate, useLocation, useParams, useSearchParams, useRoutes } from 'react-router';

export { useRoutes };

/**
 * Custom hook for navigation based on react-router.
 * Provides a simplified interface for common navigation tasks,
 * including dynamic URL parameter updates.
 */
export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Sets or updates URL query parameters.
   * @param newParams Object with keys and values to set. Set a value to null/undefined to remove it.
   * @param options.merge If true (default), merges with current params. If false, replaces all params.
   */
  const setQuery = (
    newParams: Record<string, string | number | boolean | null | undefined>,
    options: { merge?: boolean } = { merge: true }
  ) => {
    const nextParams = options.merge ? new URLSearchParams(searchParams) : new URLSearchParams();
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    setSearchParams(nextParams);
  };

  return {
    navigate,
    location,
    params,
    searchParams,
    pathname: location.pathname,
    setQuery,
  };
}

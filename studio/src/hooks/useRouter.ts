import { useNavigate, useLocation, useParams } from 'react-router';
import { useMemo, useEffect } from 'react';

/**
 * Global navigate reference to allow navigation from outside React components
 */
export let navigate: (path: any, options?: any) => void;

/**
 * Component to be rendered at the root level to capture the navigate function from React Router
 */
export const NavigateSetter = () => {
  const nav = useNavigate();

  useEffect(() => {
    navigate = nav;
  }, [nav]);

  return null;
};

/**
 * A custom hook that provides a simplified interface for React Router.
 */
export function useRouter() {
  const location = useLocation();
  const params = useParams();

  // Return a memoized object with the router properties and methods
  return useMemo(() => ({
    // Navigation methods - Using the global "navigate" populated by NavigateSetter
    push: (path: string) => navigate?.(path),
    replace: (path: string) => navigate?.(path, { replace: true }),
    back: () => navigate?.(-1),
    
    // Properties
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
    params,
    location
  }), [location, params]);
}
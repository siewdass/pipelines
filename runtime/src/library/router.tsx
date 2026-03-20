import { useNavigate, useLocation, useParams, useSearchParams, useRoutes as useRoutesBase, matchRoutes } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

/**
 * Enhanced useRoutes hook that provides automatic page transitions 
 * and dynamic metadata management (Titles/Descriptions) based on 
 * route configuration.
 */
export function useRoutes(routes: any[]) {
  const element = useRoutesBase(routes);
  const location = useLocation();

  // Find the active route's metadata directly from the route object
  const matches = matchRoutes(routes, location);
  const activeRoute = matches && matches[matches.length - 1]?.route as any;
  
  const title = activeRoute?.title;
  const description = activeRoute?.description;

  if (!element) return null;

  const siteName = "Pipelines";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-inherit">
      {/* Automatic Metadata Injection (SEO & Tabs) */}
      <Helmet>
        {title && <title>{fullTitle}</title>}
        {description && <meta name="description" content={description} />}
        
        {/* Social / Open Graph */}
        {title && <meta property="og:title" content={fullTitle} />}
        {description && <meta property="og:description" content={description} />}
      </Helmet>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full min-h-screen"
        >
          {element}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

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

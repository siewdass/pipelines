import * as React from 'react';
import SkeletonBase, { SkeletonTheme, SkeletonProps } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '../library/theme';

/**
 * Intelligent Skeleton component that automatically adjusts 
 * based on the current system theme (light/dark).
 * 
 * It wraps the base Skeleton from 'react-loading-skeleton' with a 
 * Theme provider that matches the project's background and accent colors.
 */
export const Skeleton = (props: SkeletonProps) => {
  const { theme } = useTheme();

  // Dark colors: slate-800 (#1e293b) / slate-700 (#334155)
  // Light colors: slate-100 (#f1f5f9) / slate-200 (#e2e8f0)
  const isDark = theme === "dark";

  return (
    <SkeletonTheme 
      baseColor={isDark ? "#1e293b" : "#f1f5f9"} 
      highlightColor={isDark ? "#334155" : "#e2e8f0"}
    >
      <SkeletonBase {...props} />
    </SkeletonTheme>
  );
};

export { SkeletonTheme };

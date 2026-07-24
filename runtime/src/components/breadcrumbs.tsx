import React from 'react'
import { Link, useLocation, matchRoutes } from 'react-router'
import { motion } from 'framer-motion'
import { FaChevronRight, FaHouse } from 'react-icons/fa6'

interface BreadcrumbsProps {
	/**
	 * Optional route configuration to extract titles from.
	 * If not provided, it will use path segments as labels.
	 */
	routes?: any[];
	/**
	 * Custom separator element or string.
	 */
	separator?: React.ReactNode;
	/**
	 * CSS classes for the container.
	 */
	className?: string;
}

/**
 * Breadcrumbs component for automatic navigation paths.
 * Integrates with react-router to display the hierarchy of the current URL.
 */
export function Breadcrumbs({ routes = [], separator, className = '' }: BreadcrumbsProps) {
	const location = useLocation()

	// 1. Generate breadcrumbs from matches if routes are provided, or from pathname segments
	let items: { label: string; path: string; current: boolean }[] = []

	if (routes.length > 0) {
		const matches = matchRoutes(routes, location)
		if (matches) {
			items = matches.map((match, idx) => ({
				label: (match.route as any).title || match.pathname.split('/').pop() || 'Home',
				path: match.pathname,
				current: idx === matches.length - 1
			}))
		}
	} else {
		const segments = location.pathname.split('/').filter(Boolean)
		items = [
			{ label: 'Home', path: '/', current: segments.length === 0 },
			...segments.map((segment, idx) => {
				const path = `/${segments.slice(0, idx + 1).join('/')}`
				return {
					label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
					path,
					current: idx === segments.length - 1
				}
			})
		]
	}

	return (
		<nav aria-label="Breadcrumb" className={`flex overflow-x-auto no-scrollbar ${className}`}>
			<ol className="flex items-center space-x-1 sm:space-x-2 text-xs md:text-sm font-bold tracking-tight">
				{items.map((item, idx) => (
					<li key={item.path} className="flex items-center">
						{idx !== 0 && (
							<div className="mx-1 sm:mx-2 text-slate-300 dark:text-slate-600 flex-shrink-0">
								{separator || <FaChevronRight className="w-2 h-2 md:w-3 md:h-3" />}
							</div>
						)}
						
						<motion.div
							whileHover={!item.current ? { y: -1 } : {}}
							whileTap={!item.current ? { scale: 0.98 } : {}}
						>
							<Link
								to={item.path}
								className={`
									flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200
									${item.current 
						? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-default shadow-sm border border-slate-200 dark:border-slate-700' 
						: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
					}
								`}
								aria-current={item.current ? 'page' : undefined}
							>
								{idx === 0 && <FaHouse className="w-3.5 h-3.5 mb-0.5 opacity-70" />}
								<span>{item.label}</span>
							</Link>
						</motion.div>
					</li>
				))}
			</ol>
		</nav>
	)
}

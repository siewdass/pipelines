import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Types ---

interface LoadingConfig {
	/** Script URLs to inject into the document */
	scripts?: string[];
	/** Font stylesheet URLs (e.g., Google Fonts) */
	fonts?: string[];
	/** Image URLs to preload into browser cache */
	images?: string[];
	/** Logo URL to display during loading */
	logo?: string;
	/** Title text shown during loading */
	title?: string;
	/** Background color of the loading screen */
	background?: string;
	/** Primary accent color (spinner, progress bar) */
	color?: string;
}

interface LoadingProps {
	config: LoadingConfig;
	children: React.ReactNode;
}

// --- Inline Styles (No Tailwind dependency) ---

const styles = {
	container: (bg: string): React.CSSProperties => ({
		position: 'fixed',
		inset: 0,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: bg,
		zIndex: 99999,
		transition: 'opacity 0.4s ease, visibility 0.4s ease',
	}),
	logo: {
		width: 64,
		height: 64,
		objectFit: 'contain' as const,
		marginBottom: 28,
		animation: 'loading-pulse 2s ease-in-out infinite',
	},
	title: (color: string): React.CSSProperties => ({
		fontSize: 13,
		fontWeight: 800,
		letterSpacing: '0.15em',
		textTransform: 'uppercase',
		color,
		opacity: 0.5,
		marginBottom: 24,
		fontFamily: 'system-ui, -apple-system, sans-serif',
	}),
	progressTrack: (color: string): React.CSSProperties => ({
		width: 180,
		height: 3,
		backgroundColor: `${color}15`,
		borderRadius: 99,
		overflow: 'hidden',
	}),
	progressBar: (color: string, progress: number): React.CSSProperties => ({
		width: `${progress}%`,
		height: '100%',
		backgroundColor: color,
		borderRadius: 99,
		transition: 'width 0.3s ease',
	}),
	keyframes: `
		@keyframes loading-pulse {
			0%, 100% { opacity: 0.4; transform: scale(1); }
			50% { opacity: 1; transform: scale(1.05); }
		}
	`,
};

// --- Resource Loaders ---

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		// Skip if already loaded
		if (document.querySelector(`script[src="${src}"]`)) {
			resolve();
			return;
		}
		const script = document.createElement('script');
		script.src = src;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
		document.head.appendChild(script);
	});
}

function loadFont(href: string): Promise<void> {
	return new Promise((resolve, reject) => {
		// Skip if already loaded
		if (document.querySelector(`link[href="${href}"]`)) {
			resolve();
			return;
		}
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.onload = () => resolve();
		link.onerror = () => reject(new Error(`Failed to load font: ${href}`));
		document.head.appendChild(link);
	});
}

function loadImage(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
		img.src = src;
	});
}

// --- Hook ---

/**
 * useLoading
 * 
 * Preloads external resources (scripts, fonts, images) and tracks progress.
 * Returns loading state that can be used to build custom loading screens.
 * 
 * @param config Resources to preload.
 * @returns { ready, progress, total, loaded, error }
 */
export function useLoading(config: LoadingConfig) {
	const [loaded, setLoaded] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [ready, setReady] = useState(false);
	const initiated = useRef(false);

	const allResources = [
		...(config.fonts || []).map(url => ({ type: 'font', url })),
		...(config.scripts || []).map(url => ({ type: 'script', url })),
		...(config.images || []).map(url => ({ type: 'image', url })),
		...(config.logo ? [{ type: 'image', url: config.logo }] : []),
	];

	const total = allResources.length;

	const tick = useCallback(() => {
		setLoaded(prev => {
			const next = prev + 1;
			if (next >= total) {
				setTimeout(() => setReady(true), 200);
			}
			return next;
		});
	}, [total]);

	useEffect(() => {
		if (initiated.current) return;
		initiated.current = true;

		if (total === 0) {
			setReady(true);
			return;
		}

		allResources.forEach(({ type, url }) => {
			const loader =
				type === 'script' ? loadScript(url) :
				type === 'font' ? loadFont(url) :
				loadImage(url);

			loader
				.then(tick)
				.catch((err: Error) => {
					console.warn(`[Loading] ${err.message}`);
					setError(err.message);
					tick(); // Continue loading even if one fails
				});
		});
	}, []);

	const progress = total > 0 ? Math.round((loaded / total) * 100) : 100;

	return { ready, progress, total, loaded, error };
}

// --- Component ---

/**
 * Loading
 * 
 * Full-screen preloader that injects scripts, fonts, and images into
 * the document before rendering children. Uses zero external CSS.
 * 
 * @example
 * <Loading config={{
 *   scripts: ["https://cdn.tailwindcss.com"],
 *   fonts: ["https://fonts.googleapis.com/css2?family=Outfit"],
 *   images: ["/logo.png"],
 *   logo: "/logo.png",
 *   title: "Cargando...",
 * }}>
 *   <App />
 * </Loading>
 */
export function Loading({ config, children }: LoadingProps) {
	const { ready, progress } = useLoading(config);
	const [visible, setVisible] = useState(true);

	const bg = config.background || '#000000';
	const color = config.color || '#3b82f6';

	useEffect(() => {
		if (ready) {
			const timer = setTimeout(() => setVisible(false), 450);
			return () => clearTimeout(timer);
		}
	}, [ready]);

	return (
		<>
			{/* Inject keyframe animation */}
			<style>{styles.keyframes}</style>

			{/* Loading overlay */}
			{visible && (
				<div
					style={{
						...styles.container(bg),
						opacity: ready ? 0 : 1,
						visibility: ready ? 'hidden' : 'visible',
						pointerEvents: ready ? 'none' : 'auto',
					}}
				>
					{config.logo && (
						<img src={config.logo} alt="Loading" style={styles.logo} />
					)}
					{config.title && (
						<div style={styles.title(color)}>{config.title}</div>
					)}
					<div style={styles.progressTrack(color)}>
						<div style={styles.progressBar(color, progress)} />
					</div>
				</div>
			)}

			{/* App content (mounts immediately but hidden behind overlay) */}
			{children}
		</>
	);
}

'use client';

import { useState as useDialogState, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import YouTube, { type YouTubeProps } from 'react-youtube';

import DrawingCanvas from '@/components/DrawingCanvas';
import Toolbar from '@/components/Toolbar';
import type { Annotation, ToolType } from '@/types/tool';

/** Extract YouTube video ID from URL */
function extractVideoId(url: string): string | null {
	const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
	return match ? match[1] : null;
}

const setBestQuality = (player: YT.Player) => {
	const qualities = player.getAvailableQualityLevels();
	if (qualities.includes('hd1080')) {
		player.setPlaybackQuality('hd1080');
	} else if (qualities.includes('hd720')) {
		player.setPlaybackQuality('hd720');
	}
};

const onPlayerReady: YouTubeProps['onReady'] = event => {
	setBestQuality(event.target);
	console.log('✅ YouTube Player is ready!');
};

const onPlayerStateChange: YouTubeProps['onStateChange'] = event => {
	if (event.data === 1) {
		// 1 = playing
		setBestQuality(event.target);
	}
};

export default function YouTubeAnnotator() {
	const [videoUrl, setVideoUrl] = useState<string>('');
	const [videoId, setVideoId] = useState<string | null>(null);

	const [annotations, setAnnotations] = useState<Annotation[]>([]);
	const [drawMode, setDrawMode] = useState<boolean>(false);
	const [currentTool, setCurrentTool] = useState<ToolType>('line');
	const [currentColor, setCurrentColor] = useState<string>('#ff0000');
	const [currentThickness, setCurrentThickness] = useState<number>(3);
	const [menuVisible, setMenuVisible] = useState<boolean>(true);
	const [showShortcuts, setShowShortcuts] = useDialogState(false);
	const [showHelper, setShowHelper] = useState(true);

	/** Load annotations from localStorage on mount */
	useEffect(() => {
		const saved = localStorage.getItem('yt_annotations');
		if (saved) setAnnotations(JSON.parse(saved));
	}, []);

	/** Save annotations on every change */
	useEffect(() => {
		localStorage.setItem('yt_annotations', JSON.stringify(annotations));
	}, [annotations]);

	/** Check for videoId in query params */
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const idFromQuery = params.get('videoId');
		if (idFromQuery) {
			setVideoId(idFromQuery);
		}
	}, []);

	/** On mount, check if help should be hidden */
	useEffect(() => {
		if (typeof window !== 'undefined') {
			if (localStorage.getItem('hide_shortcuts_help') === '1') {
				setShowShortcuts(false);
			}
		}
	}, []);

	/** Undo last annotation */
	const undoLastAnnotation = () => {
		setAnnotations(prev => prev.slice(0, -1));
	};

	/** Clear all annotations */
	const clearAllAnnotations = () => {
		setAnnotations([]);
		localStorage.removeItem('yt_annotations');
	};

	/** Reset state and refresh the app */
	const handleNewVideo = () => {
		setVideoId(null);
		setVideoUrl('');
		setAnnotations([]);
		localStorage.removeItem('yt_annotations');
		window.location.href = '/';
	};

	/** Handle URL form submit */
	const handleSubmitUrl = (e: React.FormEvent) => {
		e.preventDefault();
		const id = extractVideoId(videoUrl);
		if (id) {
			setVideoId(id);
		} else {
			alert('❌ Invalid YouTube URL. Please enter a correct link.');
		}
	};

	// Keyboard Shortcuts
	useHotkeys('d', event => {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
		setDrawMode(m => !m);
	});
	useHotkeys('ctrl+z', undoLastAnnotation);
	useHotkeys('ctrl+shift+c', clearAllAnnotations);
	useHotkeys('t', () => setMenuVisible(v => !v));
	useHotkeys('f', () => setCurrentTool('freehand'));
	useHotkeys('l', () => setCurrentTool('line'));
	useHotkeys('e', () => setCurrentTool('ellipse'));
	useHotkeys('a', () => setCurrentTool('arrow'));
	useHotkeys('h', () => setCurrentTool('highlight'));
	useHotkeys('c', () => setCurrentTool('circle'));
	useHotkeys('x', () => setCurrentTool('eraser'));
	useHotkeys('esc', () => setShowShortcuts(false), [setShowShortcuts]);

	// When closing with 'Don't show again', set localStorage
	const handleCloseShortcuts = () => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('hide_shortcuts_help', '1');
		}
		setShowShortcuts(false);
	};

	return (
		<div className='relative w-screen h-screen bg-black'>
			{!videoId ? (
				// 🌟 Video URL Form
				<div className='flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#232526] via-[#414345] to-[#283E51] text-white animate-fadeIn'>
					<img src='/logo.png' alt='App Logo' className='w-24 h-24 mb-4 rounded ' />
					<h1 className='text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg'>
						YouTube Annotator
					</h1>
					<p className='text-gray-200 mb-6 text-center text-lg drop-shadow'>
						Paste a YouTube video link below to start annotating.
						<br />
						<span className='text-blue-300'>Your annotations will be saved automatically.</span>
					</p>
					<form
						onSubmit={handleSubmitUrl}
						className='flex flex-col gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl w-96 border border-blue-500/30'
					>
						<input
							type='text'
							placeholder='https://youtube.com/watch?v=...'
							value={videoUrl}
							onChange={e => setVideoUrl(e.target.value)}
							className='w-full p-3 rounded-lg bg-gray-100/80 text-black focus:outline-none focus:ring-2 focus:ring-blue-400'
						/>
						<button
							type='submit'
							className='w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all font-bold shadow-md'
						>
							▶️ Load Video
						</button>
					</form>
					<p className='text-sm text-gray-400 mt-4'>
						By using this tool, you agree to our{' '}
						<a href='/privacy' target='_blank' rel='noreferrer' className='underline text-blue-300 hover:text-blue-400'>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			) : (
				<>
					{/* 📺 YouTube Player */}
					<YouTube
						videoId={videoId}
						onReady={onPlayerReady}
						onStateChange={onPlayerStateChange}
						opts={{
							width: '100%',
							height: '100%',
							playerVars: { controls: 1, vq: 'hd1080' },
						}}
						className='absolute top-0 left-0 w-full h-full'
					/>

					{/* 📝 Drawing Canvas */}
					<DrawingCanvas
						annotations={annotations}
						setAnnotations={setAnnotations}
						currentTool={currentTool}
						currentColor={currentColor}
						currentThickness={currentThickness}
						drawMode={drawMode}
					/>

					{/* 🛠️ Toolbar */}
					<Toolbar
						currentTool={currentTool}
						setCurrentTool={setCurrentTool}
						currentColor={currentColor}
						setCurrentColor={setCurrentColor}
						currentThickness={currentThickness}
						setCurrentThickness={setCurrentThickness}
						drawMode={drawMode}
						setDrawMode={setDrawMode}
						undo={undoLastAnnotation}
						clear={clearAllAnnotations}
						menuVisible={menuVisible}
						setMenuVisible={setMenuVisible}
						onNewVideo={handleNewVideo}
						showHelp={() => setShowShortcuts(true)}
					/>

					{/* 💡 Combined Helper */}
					{showHelper && (
						<div className='fixed bottom-12 right-4 z-50 bg-blue-900/90 text-blue-100 text-xs px-4 py-3 rounded-lg shadow-lg flex flex-col gap-2 max-w-xs'>
							<button
								onClick={() => setShowHelper(false)}
								className='absolute top-1 right-2 text-blue-300 hover:text-white text-lg font-bold focus:outline-none'
								style={{ lineHeight: 1 }}
								aria-label='Close helper tip'
								type='button'
							>
								×
							</button>
							<div className='flex items-center gap-2'>
								<span className='text-lg'>💡</span>
								<span>
									Use <kbd className='bg-blue-800 px-1 rounded text-white'>D</kbd> to toggle drawing mode
								</span>
							</div>
							<div className='flex items-center gap-2'>
								<span className='text-lg'>🖥️</span>
								<span>
									<b>For best experience:</b> Use your browser&apos;s fullscreen (<kbd>F11</kbd> or macOS green button).
									<br />
									<b>Do NOT use YouTube&apos;s fullscreen</b>—it will break annotation features.
								</span>
							</div>
						</div>
					)}

					{/* ❓ Shortcuts Help Dialog */}
					{showShortcuts && (
						<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
							<div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative'>
								<button
									onClick={handleCloseShortcuts}
									className='absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold'
									aria-label='Close shortcuts dialog'
									type='button'
								>
									×
								</button>
								<h2 className='text-2xl font-bold mb-4 text-center'>Keyboard Shortcuts</h2>
								<ul className='space-y-2 text-lg'>
									<li>
										<kbd className='kbd'>D</kbd> — Toggle Draw Mode
									</li>
									<li>
										<kbd className='kbd'>Ctrl+Z</kbd> — Undo
									</li>
									<li>
										<kbd className='kbd'>Ctrl+Shift+C</kbd> — Clear All
									</li>
									<li>
										<kbd className='kbd'>T</kbd> — Show/Hide Toolbar
									</li>
									<li>
										<kbd className='kbd'>F</kbd> — Freehand Tool
									</li>
									<li>
										<kbd className='kbd'>L</kbd> — Line Tool
									</li>
									<li>
										<kbd className='kbd'>E</kbd> — Ellipse Tool
									</li>
									<li>
										<kbd className='kbd'>A</kbd> — Arrow Tool
									</li>
									<li>
										<kbd className='kbd'>H</kbd> — Highlight Tool
									</li>
									<li>
										<kbd className='kbd'>C</kbd> — Circle Tool
									</li>
									<li>
										<kbd className='kbd'>X</kbd> — Eraser Tool
									</li>
								</ul>
								<div className='mt-6 text-blue-900 bg-blue-100/80 rounded p-3 text-xs'>
									<b>Important:</b> For fullscreen, use your browser&apos;s fullscreen (<kbd>F11</kbd> or macOS green
									button).
									<br />
									<b>Do NOT use YouTube&apos;s fullscreen</b>—it will break annotation features.
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

import type { ToolType } from '@/types/tool';
import { useCallback, useEffect, useRef, useState } from 'react';
import ColorPicker from './ColorPicker';
import ThicknessSlider from './ThicknessSlider';

type ToolbarProps = {
	currentTool: ToolType;
	setCurrentTool: (tool: ToolType) => void;
	currentColor: string;
	setCurrentColor: (color: string) => void;
	currentThickness: number;
	setCurrentThickness: (thickness: number) => void;
	drawMode: boolean;
	setDrawMode: (mode: boolean) => void;
	undo: () => void;
	clear: () => void;
	menuVisible: boolean;
	setMenuVisible: (visible: boolean) => void;
	onNewVideo: () => void;
	showHelp?: () => void;
};

export default function Toolbar({
	currentTool,
	setCurrentTool,
	currentColor,
	setCurrentColor,
	currentThickness,
	setCurrentThickness,
	drawMode,
	setDrawMode,
	undo,
	clear,
	menuVisible,
	setMenuVisible,
	showHelp,
}: ToolbarProps) {
	const [position, setPosition] = useState({ x: 20, y: 20 }); // 🖱️ Initial position
	const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const isDragging = useRef(false);
	const hasMoved = useRef(false); // ✅ Track movement to differentiate drag vs click

	/** Start dragging */
	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		isDragging.current = true;
		hasMoved.current = false; // Reset movement detection
		dragOffset.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		};
		e.preventDefault();
	};

	/** Track dragging */
	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (isDragging.current) {
				const newX = e.clientX - dragOffset.current.x;
				const newY = e.clientY - dragOffset.current.y;

				// Mark as moved if position changes
				if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
					hasMoved.current = true;
				}

				setPosition({ x: newX, y: newY });
			}
		},
		[position.x, position.y]
	);

	/** Stop dragging */
	const handleMouseUp = useCallback(() => {
		isDragging.current = false;
	}, []);

	/** Add/remove event listeners for dragging */
	useEffect(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [handleMouseMove, handleMouseUp]);

	/** FAB click handler */
	const handleFabClick = () => {
		if (!hasMoved.current) {
			setMenuVisible(true); // Only toggle if not dragged
		}
	};

	const handleNewVideo = () => {
		window.location.reload(); // Simply refresh page for prototype
	};

	const tools: { type: ToolType; label: string; icon: string; shortcut: string }[] = [
		{ type: 'freehand', label: 'Freehand', icon: '✏️', shortcut: 'F' },
		{ type: 'line', label: 'Line', icon: '📏', shortcut: 'L' },
		{ type: 'ellipse', label: 'Ellipse', icon: '🔵', shortcut: 'E' },
		{ type: 'arrow', label: 'Arrow', icon: '➡️', shortcut: 'A' },
		{ type: 'highlight', label: 'Highlight', icon: '🟨', shortcut: 'H' },
		{ type: 'circle', label: 'Circle', icon: '⚪', shortcut: 'C' },
		{ type: 'eraser', label: 'Eraser', icon: '🧽', shortcut: 'X' },
	];

	return (
		<>
			{menuVisible ? (
				<div
					style={{
						position: 'absolute',
						left: position.x,
						top: position.y,
						zIndex: 50,
						cursor: isDragging.current ? 'grabbing' : 'grab',
					}}
					className='bg-zinc-900/90 backdrop-blur-lg rounded-xl shadow-xl p-4 flex flex-col gap-3 w-60 animate-fadeIn max-h-screen overflow-y-auto'
					onMouseDown={handleMouseDown}
				>
					{/* 🖊️ Draw Mode Toggle */}
					<button
						onClick={() => setDrawMode(!drawMode)}
						className={`flex items-center gap-1 w-full px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors ${drawMode ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-white hover:bg-zinc-600'}`}
						title={drawMode ? 'Disable Drawing' : 'Enable Drawing'}
						type='button'
					>
						<span className='text-lg'>{drawMode ? '🖊️' : '🎥'}</span>
						<span className='flex-1 flex items-center justify-between'>
							{drawMode ? 'DRAWING ON' : 'DRAWING OFF'}
							<span className='ml-2 bg-zinc-800 text-xs px-1.5 py-0.5 rounded font-mono opacity-70 flex-shrink-0'>
								D
							</span>
						</span>
					</button>

					{/* 🎨 Tool Buttons */}
					<div className='grid grid-cols-2 gap-1'>
						{tools.map(tool => (
							<button
								key={tool.type}
								onClick={() => setCurrentTool(tool.type)}
								className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium text-xs transition-colors w-full ${currentTool === tool.type ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-white hover:bg-zinc-600'}`}
								title={tool.label}
								type='button'
							>
								<span className='text-base flex-shrink-0'>{tool.icon}</span>
								<span className='flex-1 flex items-center justify-between'>
									{tool.label}
									<span className='ml-2 bg-zinc-800 text-[10px] px-1 py-0.5 rounded font-mono opacity-70 flex-shrink-0'>
										{tool.shortcut}
									</span>
								</span>
							</button>
						))}
					</div>

					{/* 🎨 Color Picker */}
					<div className='flex flex-col gap-0.5 mt-1'>
						<span className='text-xs font-semibold text-zinc-200 mb-0.5'>🎨 Color</span>
						<ColorPicker currentColor={currentColor} setCurrentColor={setCurrentColor} />
					</div>

					{/* 📏 Thickness Slider */}
					<div className='flex flex-col gap-0.5 mt-1'>
						<span className='text-xs font-semibold text-zinc-200 mb-0.5'>📏 Thickness</span>
						<ThicknessSlider currentThickness={currentThickness} setCurrentThickness={setCurrentThickness} />
					</div>

					{/* 🔄 Undo / Clear */}
					<div className='flex flex-row gap-1 mt-0.5'>
						<button
							onClick={undo}
							className='flex-1 flex items-center justify-center gap-0.5 bg-zinc-700 hover:bg-zinc-600 text-white px-1.5 py-1 rounded-lg text-[11px] font-medium transition-colors'
							title='Undo'
							type='button'
						>
							↩️ Undo
						</button>
						<button
							onClick={clear}
							className='flex-1 flex items-center justify-center gap-0.5 bg-zinc-700 hover:bg-zinc-600 text-white px-1.5 py-1 rounded-lg text-[11px] font-medium transition-colors'
							title='Clear All'
							type='button'
						>
							🗑️ Clear
						</button>
					</div>

					{/* 🔄 New Video */}
					<button
						onClick={handleNewVideo}
						className='w-full flex items-center justify-center gap-0.5 bg-zinc-700 hover:bg-zinc-600 text-white px-1.5 py-1 rounded-lg text-[11px] font-medium transition-colors mt-0.5'
						title='Load a New Video'
						type='button'
					>
						🔄 New Video
					</button>

					{/* ❓ Help Button */}
					{showHelp && (
						<button
							type='button'
							className='w-full flex items-center justify-center gap-0.5 bg-zinc-700 hover:bg-zinc-600 text-white px-1.5 py-1 rounded-lg text-[11px] font-medium transition-colors mt-0.5'
							title='Show Shortcuts'
							onClick={showHelp}
						>
							❓ Help
						</button>
					)}

					{/* ❌ Hide Toolbar */}
					<button
						onClick={() => setMenuVisible(false)}
						className='w-full flex items-center justify-center gap-0.5 bg-red-600 hover:bg-red-700 text-white px-1.5 py-1 rounded-lg text-[11px] font-medium transition-colors mt-0.5'
						title='Hide Toolbar'
						type='button'
					>
						Hide
					</button>
				</div>
			) : (
				<div
					style={{
						position: 'absolute',
						left: position.x,
						top: position.y,
						zIndex: 1000,
						cursor: isDragging.current ? 'grabbing' : 'grab',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
					onMouseDown={handleMouseDown}
					onClick={handleFabClick}
					onKeyUp={e => {
						if (e.key === 'Enter' || e.key === ' ') handleFabClick();
					}}
					title='Show Dock'
					className={`bg-zinc-900/90 border-2 ${drawMode ? 'border-blue-500' : 'border-gray-500'} shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-zinc-800 transition-colors duration-150`}
				>
					<span className='text-2xl'>{drawMode ? '🖊️' : '🛠️'}</span>
				</div>
			)}
		</>
	);
}

type ColorPickerProps = {
	currentColor: string;
	setCurrentColor: (color: string) => void;
	disabled?: boolean;
};

const presetColors = [
	'#FF0000',
	'#00FF00',
	'#0000FF',
	'#FFFF00',
	'#FF00FF',
	'#00FFFF',
	'#FFFFFF',
	'#000000',
	'#FFA500',
	'#800080',
];

export default function ColorPicker({
	currentColor,
	setCurrentColor,
	disabled = false, // default false
}: ColorPickerProps) {
	return (
		<div className='grid grid-cols-5 gap-2'>
			{presetColors.map(color => (
				<button
					key={color}
					type='button'
					className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150
            ${currentColor === color ? 'border-blue-400 ring-2 ring-blue-400' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-blue-300'}
          `}
					style={{ backgroundColor: color }}
					onClick={() => !disabled && setCurrentColor(color)}
					disabled={disabled}
					aria-label={`Select color ${color}`}
				/>
			))}
			<label
				className='relative w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer transition-all duration-150 bg-white hover:scale-110'
				title='Pick a custom color'
			>
				<span className='text-lg pointer-events-none select-none absolute inset-0 flex items-center justify-center'>
					🎨
				</span>
				<input
					type='color'
					value={currentColor}
					onChange={e => setCurrentColor(e.target.value)}
					disabled={disabled}
					className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
				/>
			</label>
		</div>
	);
}

type ColorPickerProps = {
  currentColor: string;
  setCurrentColor: (color: string) => void;
  disabled?: boolean;
};

const presetColors = [
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#FFFFFF", "#000000", "#FFA500", "#800080"
];

export default function ColorPicker({
  currentColor,
  setCurrentColor,
  disabled = false, // default false
}: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presetColors.map((color) => (
        <button
          key={color}
          className={`w-6 h-6 rounded-full border-2 focus:outline-none ${
            currentColor === color ? "border-white" : "border-gray-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ backgroundColor: color }}
          onClick={() => !disabled && setCurrentColor(color)} // 🛡️ disable click
          disabled={disabled} // For accessibility
        />
      ))}
      <input
        type="color"
        value={currentColor}
        onChange={(e) => setCurrentColor(e.target.value)}
        disabled={disabled}
        className={`w-8 h-8 border-0 p-0 rounded-full ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={disabled ? "Disabled" : "Pick a custom color"}
      />
    </div>
  );
}

type ThicknessSliderProps = {
  currentThickness: number;
  setCurrentThickness: (thickness: number) => void;
  disabled?: boolean; // 🆕 optional
};

export default function ThicknessSlider({
  currentThickness,
  setCurrentThickness,
  disabled = false, // default to false
}: ThicknessSliderProps) {
  return (
    <input
      type="range"
      min={1}
      max={20}
      onMouseDown={(e) => e.stopPropagation()}
      value={currentThickness}
      onChange={(e) => setCurrentThickness(Number(e.target.value))}
      disabled={disabled} // 🆕 apply disabled
      className={`thickness-slider ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    />
  );
}

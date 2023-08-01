// This function recieves an hex color and decides if
// the background should be dark or light
export const getContrastColor = (hexColor: string) => {
  const r = parseInt(hexColor.substring(1, 2), 16);
  const g = parseInt(hexColor.substring(3, 2), 16);
  const b = parseInt(hexColor.substring(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
};

export const getRandomHex = () => {
  const hex = Math.floor(Math.random() * 16777215).toString(16);
  return `#${hex}`;
}
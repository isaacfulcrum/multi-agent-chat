/**********************************************************************************************/
export function normalizeString(inputString: string): string {
  // Remove special characters using regular expression
  const cleanedString = inputString.replace(/[^a-zA-Z0-9]/g, "");

  // Convert to lowercase
  const normalizedString = cleanedString.toLowerCase();

  return normalizedString;
}

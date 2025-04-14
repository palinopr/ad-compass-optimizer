
export const metaSubcodeDescriptions: Record<number, string> = {
  33: "Insufficient permissions. The app needs additional access rights.",
  458: "Session expired. Please reconnect your Meta account.",
  459: "User logged out. Please re-authenticate.",
  460: "Token expired. Please refresh your Meta login.",
  463: "Session invalid. Token is no longer valid.",
  464: "Session has been invalidated for security reasons.",
  467: "User has not granted the required permissions.",
  1487: "Rate limit reached. Please wait a few minutes.",
  1489: "Business use case rate limit reached.",
  2018: "The provided token is invalid or has expired."
};

export const getSubcodeDescription = (subcode: number | undefined): string | undefined => {
  if (!subcode) return undefined;
  return metaSubcodeDescriptions[subcode];
};

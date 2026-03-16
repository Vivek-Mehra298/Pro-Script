export const resolveImageUrl = (path: string | undefined) => {
  if (!path) return "";
  
  // If it's already an absolute URL (e.g., from an old blog post or an external link), return it
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  // Otherwise, treat it as a relative path from our backend
  const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${backendUrl}${normalizedPath}`;
};

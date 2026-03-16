export const resolveImageUrl = (path: string | undefined) => {
  if (!path) return "";
  
  const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // If it's a legacy localhost link from a previous upload, fix it on the fly
  if (path.includes("localhost:4000") || path.includes("127.0.0.1:4000")) {
    const relativePart = path.split("/uploads/")[1];
    return relativePart ? `${backendUrl}/uploads/${relativePart}` : path;
  }
  
  // If it's already an absolute URL (external link), return it
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  // Otherwise, treat it as a relative path from our backend
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${backendUrl}${normalizedPath}`;
};

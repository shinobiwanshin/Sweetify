import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url) {
  if (!url) return null;

  // If URL is localhost, replace with production base URL
  if (url.includes("localhost:8080")) {
    const baseUrl = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
      : "https://sweetify-iqjo.onrender.com";
    return url.replace(/http:\/\/localhost:8080/, baseUrl);
  }

  // If URL is relative (starts with /), prepend base URL
  if (url.startsWith("/")) {
    const baseUrl = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
      : "https://sweetify-iqjo.onrender.com";
    return `${baseUrl}${url}`;
  }

  return url;
}

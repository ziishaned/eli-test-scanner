import { DateTime } from "luxon";

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (dateString: string): string => {
  return DateTime.fromJSDate(new Date(dateString)).toLocaleString(
    DateTime.DATETIME_SHORT
  );
};

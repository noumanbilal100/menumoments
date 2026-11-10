/**
 * Shrinks an image in the browser before upload: longest side capped at
 * 1600px and re-encoded as WebP. Keeps the original when it is a GIF (to
 * keep animation) or when re-encoding would not make it smaller.
 */
export async function compressImage(
  file: File,
  maxSide = 1600,
  quality = 0.82,
): Promise<{ file: File; width?: number; height?: number }> {
  if (file.type === 'image/gif') return { file };
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { file };
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob || (blob.size >= file.size && scale === 1)) return { file, width, height };
  const name = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`;
  return { file: new File([blob], name, { type: 'image/webp' }), width, height };
}

/** A file name Google can read: "Crockpot Chicken Soup" → "crockpot-chicken-soup", cut at a whole word. */
export function seoFileName(text: string): string {
  const full = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return full.length <= 70 ? full : full.slice(0, 71).replace(/-[^-]*$/, '');
}

/** The same picture under the editor's chosen name; the upload is saved under it. */
export function renameFile(file: File, base: string): File {
  const ext = file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? '';
  return new File([file], `${seoFileName(base) || 'image'}${ext}`, { type: file.type });
}

export function extensionOf(file: File): string {
  return file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? '';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

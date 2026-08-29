/**
 * Automatically compress client-side image files before uploading.
 * Reduces raw 5-15MB camera photos down to optimized ~300-800KB web images.
 */
export async function compressImageIfNeeded(
  file: File,
  maxDimension = 2048,
  quality = 0.85
): Promise<File> {
  // If not an image (or is SVG / GIF / PDF / video), return original file
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  // If already small (< 600KB), no need to compress
  if (file.size < 600 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const outputType = file.type === "image/png" && file.size < 2 * 1024 * 1024 ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, outputType === "image/png" ? ".png" : ".jpg"), {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Create a lightweight, optimized thumbnail (max 480px) as Data URL.
 * Typically 15KB - 40KB, perfect for instant gallery grid rendering.
 */
export async function createThumbnailDataUrl(
  source: File | string,
  maxDimension = 480,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const processLoadedImage = () => {
      let width = img.width;
      let height = img.height;

      if (!width || !height) {
        return resolve(typeof source === "string" ? source : "");
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(typeof source === "string" ? source : "");
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        // Prefer webp if supported, otherwise jpeg
        const dataUrl = canvas.toDataURL("image/webp", quality);
        resolve(dataUrl);
      } catch {
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch (e) {
          resolve(typeof source === "string" ? source : "");
        }
      }
    };

    img.onload = processLoadedImage;
    img.onerror = () => resolve(typeof source === "string" ? source : "");

    if (typeof source === "string") {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Safely parse JSON from fetch Response, handling 413, 504, 500 HTML gracefully
 */
export async function safeFetchJson(res: Response): Promise<any> {
  const text = await res.text();
  if (res.status === 413 || text.includes("Request Entity Too Large")) {
    throw new Error("File or request size is too large (maximum 4.5MB limit on Vercel). Please upload a smaller image.");
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Server returned error (${res.status}): ${text.slice(0, 100)}`);
    }
    throw new Error("Invalid response from server");
  }
}


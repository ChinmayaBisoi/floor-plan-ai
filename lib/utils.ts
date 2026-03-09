export const HOSTING_CONFIG_KEY = "floorplan_hosting_config";
export const HOSTING_DOMAIN_SUFFIX = ".puter.site";

export const isHostedUrl = (value: unknown): value is string =>
  typeof value === "string" && value.includes(HOSTING_DOMAIN_SUFFIX);

export const createHostingSlug = () =>
  `floorplan-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const normalizeHost = (subdomain: string) =>
  subdomain.endsWith(HOSTING_DOMAIN_SUFFIX)
    ? subdomain
    : `${subdomain}${HOSTING_DOMAIN_SUFFIX}`;

export const getHostedUrl = (
  hosting: { subdomain: string },
  filePath: string,
): string | null => {
  if (!hosting?.subdomain) return null;
  const host = normalizeHost(hosting.subdomain);
  return `https://${host}/${filePath}`;
};

export const getImageExtension = (contentType: string, url: string): string => {
  const type = (contentType || "").toLowerCase();
  const typeMatch = type.match(/image\/(png|jpe?g|webp|gif|svg\+xml|svg)/);
  if (typeMatch?.[1]) {
    const ext = typeMatch[1].toLowerCase();
    return ext === "jpeg" || ext === "jpg"
      ? "jpg"
      : ext === "svg+xml"
        ? "svg"
        : ext;
  }

  const dataMatch = url.match(/^data:image\/([a-z0-9+.-]+);/i);
  if (dataMatch?.[1]) {
    const ext = dataMatch[1].toLowerCase();
    return ext === "jpeg" ? "jpg" : ext;
  }

  const extMatch = url.match(/\.([a-z0-9]+)(?:$|[?#])/i);
  if (extMatch?.[1]) return extMatch[1].toLowerCase();

  return "png";
};

export const dataUrlToBlob = (
  dataUrl: string,
): { blob: Blob; contentType: string } | null => {
  try {
    const match = dataUrl.match(/^data:([^;]+)?(;base64)?,([\s\S]*)$/i);
    if (!match) return null;
    const contentType = match[1] || "";
    const isBase64 = !!match[2];
    const data = match[3] || "";
    const raw = isBase64
      ? atob(data.replace(/\s/g, ""))
      : decodeURIComponent(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      bytes[i] = raw.charCodeAt(i);
    }
    return { blob: new Blob([bytes], { type: contentType }), contentType };
  } catch {
    return null;
  }
};

export const fetchBlobFromUrl = async (
  url: string,
): Promise<{ blob: Blob; contentType: string } | null> => {
  if (url.startsWith("data:")) {
    return dataUrlToBlob(url);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    return {
      blob: await response.blob(),
      contentType: response.headers.get("content-type") || "",
    };
  } catch {
    return null;
  }
};

const getBlobFromImageUrl = async (
  url: string,
): Promise<{ blob: Blob; contentType: string } | null> => {
  const fetched = await fetchBlobFromUrl(url);
  if (fetched) return fetched;
  const blob = await imageUrlToPngBlob(url);
  if (blob) return { blob, contentType: "image/png" };
  return null;
};

/** Trigger download of an image from a URL (data URL or http). */
export const downloadImageFromUrl = async (
  url: string,
  filename: string,
): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  const result = await getBlobFromImageUrl(url);
  if (!result) return false;
  const ext = getImageExtension(result.contentType, url);
  const name = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(result.blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  return true;
};

/** Share an image via Web Share API (file). Returns false if not supported or fails. */
export const shareImageFromUrl = async (
  url: string,
  filename: string,
  title?: string,
): Promise<boolean> => {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const result = await getBlobFromImageUrl(url);
  if (!result) return false;
  const ext = getImageExtension(result.contentType, url);
  const name = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
  const file = new File([result.blob], name, { type: result.contentType });
  try {
    await navigator.share({
      files: [file],
      title: title || name,
    });
    return true;
  } catch (e) {
    if ((e as Error).name === "AbortError") return true;
    return false;
  }
};

export const imageUrlToPngBlob = async (url: string): Promise<Blob | null> => {
  if (typeof window === "undefined") return null;

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });

    const width = loaded.naturalWidth || loaded.width;
    const height = loaded.naturalHeight || loaded.height;
    if (!width || !height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(loaded, 0, 0, width, height);

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/png");
    });
  } catch {
    return null;
  }
};

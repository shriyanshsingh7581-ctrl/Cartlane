/**
 * Cloudinary Upload & Responsive Image Transformation Utility
 * Configured with:
 * - Cloud Name: "dxeuzdwkz"
 * - Upload Preset: "Uttam Charitable"
 */

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
  import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  'dxeuzdwkz';

export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  import.meta.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  'Uttam Charitable';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format "${file.type}". Allowed formats: JPG, PNG, WebP, AVIF.`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the 8 MB limit.`,
    };
  }
  return { valid: true };
}

export function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id || '',
            width: response.width || 800,
            height: response.height || 600,
            format: response.format || 'jpg',
          });
        } else {
          const rawMsg = response?.error?.message || `HTTP ${xhr.status}`;
          if (
            rawMsg.toLowerCase().includes('preset') ||
            rawMsg.toLowerCase().includes('unsigned') ||
            rawMsg.toLowerCase().includes('whitelisted')
          ) {
            reject(
              new Error(
                `Cloudinary rejected upload preset "${CLOUDINARY_UPLOAD_PRESET}" on cloud "${CLOUDINARY_CLOUD_NAME}": ${rawMsg}. Correction required: In your Cloudinary Dashboard -> Settings -> Upload -> Upload presets, verify that a preset named "${CLOUDINARY_UPLOAD_PRESET}" exists and its Signing Mode is set to "Unsigned".`
              )
            );
          } else {
            reject(new Error(`Cloudinary upload failed: ${rawMsg}`));
          }
        }
      } catch {
        reject(new Error(`Cloudinary upload failed with status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while connecting to Cloudinary upload endpoint.'));
    };

    xhr.send(formData);
  });
}

/**
 * Uploads an authorized remote image URL directly to Cloudinary using the unsigned preset
 * so its Cloudinary secure_url and public_id can be persisted in Firestore.
 */
export function uploadRemoteUrlToCloudinary(
  remoteImageUrl: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    if (!remoteImageUrl || !remoteImageUrl.startsWith('http')) {
      reject(new Error('A valid http/https image URL is required for remote import.'));
      return;
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', remoteImageUrl);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id || '',
            width: response.width || 1100,
            height: response.height || 1100,
            format: response.format || 'jpg',
          });
        } else {
          const rawMsg = response?.error?.message || `HTTP ${xhr.status}`;
          reject(new Error(`Cloudinary remote import failed: ${rawMsg}`));
        }
      } catch {
        reject(new Error(`Cloudinary remote import failed with status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while connecting to Cloudinary upload endpoint.'));
    };

    xhr.send(formData);
  });
}

/**
 * Applies responsive Cloudinary transformations (f_auto,q_auto,c_limit,w_...)
 * Preserves SVG data URIs or local assets untouched.
 */
export function getOptimizedImageUrl(url: string, width = 800): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('/upload/f_auto')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
  return url;
}


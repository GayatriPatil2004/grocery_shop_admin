/**
 * Utility to upload files directly to Cloudinary from the browser using Signed Uploads.
 * Note: Client-side signing exposes the API Secret in the bundle.
 */

/**
 * Generates a SHA-1 signature for Cloudinary signed uploads using the Web Crypto API.
 */
async function generateSignature(paramsToSign, secret) {
  // 1. Sort parameters alphabetically
  const sortedKeys = Object.keys(paramsToSign).sort();
  
  // 2. Create the string to sign: key1=value1&key2=value2...API_SECRET
  const signString = sortedKeys
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&') + secret;

  // 3. Hash with SHA-1
  const encoder = new TextEncoder();
  const data = encoder.encode(signString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  // 4. Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const uploadToCloudinary = async (file, folder = 'general') => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration missing (Cloud Name, API Key, or API Secret). Check your .env file.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folderPath = `supermart/${folder}`;

  // Parameters to include in the signature (must match exactly what we send in FormData)
  const paramsToSign = {
    folder: folderPath,
    timestamp: timestamp
  };

  try {
    const signature = await generateSignature(paramsToSign, apiSecret);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('folder', folderPath);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url; 
  } catch (error) {
    console.error('Cloudinary Signed Upload Error:', error);
    throw error;
  }
};

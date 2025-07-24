// Minimal hook to resolve imports
export const useImageUpload = () => {
  return {
    uploadImages: () => Promise.resolve([]),
    isUploading: false,
  };
};
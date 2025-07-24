// Utility to refresh the page
export const refreshPage = () => {
  window.location.reload();
};

// Auto-refresh on page load
if (typeof window !== 'undefined') {
  window.location.reload();
}
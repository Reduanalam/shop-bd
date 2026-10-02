// Shared "login required" gate for actions like Add to Cart / Buy Now.
// If the user isn't logged in, sends them to /login and brings them back
// to the current page afterwards instead of just failing silently.
export function requireLogin(userInfo, navigate, redirectPath, action) {
  if (!userInfo) {
    navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    return false;
  }
  action();
  return true;
}

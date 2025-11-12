function saveLastUserPage() {
  const url = new URL(window.location.href);
  let cleanUrl = url
  if (url.search) {
    let pathParts = url.pathname.split('/').filter(Boolean);
    let basePath = '/';
    if (pathParts.length > 0) {
      basePath += pathParts[0] + '/';
    }
    cleanUrl = url.origin + basePath;
  }
  localStorage.setItem("last_user_page", cleanUrl);
}



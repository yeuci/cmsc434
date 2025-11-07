// utils
export function showToast(message, type = "info", opts = {}) {
  const { duration = 6500 } = opts;
  let host = document.querySelector(".toast-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "toast-host";
    document.body.appendChild(host);
  }
  const nav = document.querySelector(".navigation");
  if (nav) {
    const h = nav.offsetHeight || 90;
    host.style.bottom = `calc(${h}px + var(--toast-gap, 16px))`;
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.setProperty("--toast-hide-delay", `${duration}ms`);
  host.appendChild(toast);
  const cleanupTime = duration + 1200;
  setTimeout(() => {
    toast.remove();
    if (!host.childElementCount) host.remove();
  }, cleanupTime);
}

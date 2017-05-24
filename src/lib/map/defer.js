export function defer(func) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      func();
      resolve();
    }, 100);
  });
}

/** Shrinks a canvas data URL so a painting can travel inside a request. */
export function paintingForAi(dataUrl, maxWidth = 512) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => reject(new Error("could not read the canvas"));
    image.src = dataUrl;
  });
}
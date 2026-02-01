function supportsWebPSync() {
    const canvas = document.createElement("canvas");
    if (!canvas.getContext) return false;
    const supported =  canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;

    if(supported) {
        document.body.classList.add("webp");
    } else {
        document.body.classList.add("no-webp");
    }
}

console.log("WebP supported:", supportsWebPSync());
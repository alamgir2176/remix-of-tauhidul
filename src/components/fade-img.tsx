import { useEffect, useRef, type ImgHTMLAttributes } from "react";

/**
 * An image that eases in once it has loaded. The image is fully visible by default, so nothing
 * depends on JavaScript: only an image that is still loading when the page hydrates gets the
 * soft placeholder, and the class is removed as soon as it finishes (or fails).
 */
export function FadeImg(props: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (!img || img.complete) return;
    img.classList.add("is-loading");
    const done = () => img.classList.remove("is-loading");
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    return () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
    };
  }, [props.src]);
  return <img ref={ref} alt="" {...props} className={["fade-img", props.className].filter(Boolean).join(" ")} />;
}

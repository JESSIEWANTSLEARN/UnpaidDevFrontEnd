import { useEffect, useRef, useState } from "react";

/*
 * Small reusable scroll-reveal wrapper.
 * It uses the browser IntersectionObserver, so no animation library is needed.
 */
function CinematicReveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  threshold = 0.14,
  ...rest
}) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return undefined;

    // Respect the user's accessibility preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisible(true);
        observer.unobserve(element);
      },
      {
        threshold,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={elementRef}
      className={`cinematic-reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={{ "--reveal-delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default CinematicReveal;

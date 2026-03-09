import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useMobileScrollThreshold() {
  const isMobile = useIsMobile();
  const [isOverThreshold, setIsOverThreshold] = React.useState(false);

  React.useEffect(() => {
    if (!isMobile) {
      setIsOverThreshold(false);
      return;
    }

    const checkScroll = () => {
      // Threshold is the viewport width (square gallery height)
      setIsOverThreshold(window.scrollY >= window.innerWidth - 56); // 56 is header height
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, [isMobile]);

  return isOverThreshold;
}

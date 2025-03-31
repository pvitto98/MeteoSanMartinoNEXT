import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const useScrollExpanded = (threshold: number = 20): boolean => {
  const [expanded, setExpanded] = useState(true);
  const { pathname } = useRouter();

  useEffect(() => {
    if (pathname !== '/') {
      // Disable the hook if not on the homepage
      setExpanded(false);
      return;
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (!isMobile) {
      // Permanently set expanded to false for screens wider than 767px
      setExpanded(false);
      return;
    }

    const handleScroll = () => {
      setExpanded(window.scrollY < threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, pathname]);

  return expanded;
};

export default useScrollExpanded;

import { useRef, useEffect } from "react";

export default function useLazyLoad(element, loadMore) {
  const observer = useRef();
  const loadMoreRef = useRef();

  useEffect(() => {
    loadMoreRef.current = loadMore
  }, [loadMore]);

  useEffect(() => {
    observer.current = new IntersectionObserver(async (entries) => {
      // if element is visible to the user, load the next options
      const loadNewOptions = entries[0].isIntersecting;
      if (loadNewOptions) loadMoreRef.current();
    });
  }, []);

  useEffect(() => {
    if (!element) return;
    //console.log(element)
    observer.current.observe(element);
    return () => observer.current.unobserve(element);
  }, [element]);
}

import { useState, useEffect } from "react";

function getAllNestedChildren(item) {
  // check if item has children
  if (!item || ![...item?.childNodes].length) return [item];

  // item has children
  const children = [item];
  for (let i = 0; i < item.childNodes.length; i++) {
    children.push(...getAllNestedChildren(item.childNodes[i]));
  }

  return children;
}

export default function useLooseFocus(
  toggleFocusItemRefs,
  keepFocusItemRefs,
  defaultFocus = false
) {
  const [focus, setFocus] = useState(defaultFocus);

  useEffect(() => {
    const toggleFocusItems = [];
    toggleFocusItemRefs?.forEach((itemRef) =>
      toggleFocusItems.push(...getAllNestedChildren(itemRef?.current))
    );
    
    const keepFocusItems = [];
    keepFocusItemRefs?.forEach((itemRef) =>
      keepFocusItems.push(...getAllNestedChildren(itemRef?.current))
    );
    const clickHandler = (evt) => {
      // click on something which should not affect the focus
      if (keepFocusItems.includes(evt.target)) return;

      // click on something which should toggle the focus
      if (toggleFocusItems.includes(evt.target))
        return setFocus((prev) => !prev);

      // click on anything else of the screen
      setFocus(false);
    };
    window.addEventListener("click", clickHandler);

    return () => window.removeEventListener("click", clickHandler);
  }, [keepFocusItemRefs, toggleFocusItemRefs]);

  return [focus, setFocus];
}

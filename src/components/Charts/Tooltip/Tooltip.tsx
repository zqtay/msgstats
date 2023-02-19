import { RefObject, useCallback, useEffect, useRef } from "react";
import styles from "./Tooltip.module.scss";

const Tooltip = (props: {show: boolean, rectPos: DOMRect, text: string}) => {
  const ttRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback((tooltip: HTMLDivElement, rectPos: DOMRect, text: string) => {
    tooltip.innerHTML = text;
    tooltip.className = `${styles["tooltip"]} ${styles["tooltip-transparent"]}`;
    const ttPos = tooltip.getBoundingClientRect();
    tooltip.style.left = `${((rectPos.left + rectPos.right) / 2) - ((ttPos.right - ttPos.left) / 2)}px`;
    tooltip.style.top = `${rectPos.top - (ttPos.bottom - ttPos.top) - 10 + window.scrollY}px`;
    tooltip.className = `${styles["tooltip"]} ${styles["tooltip-show"]}`;
  }, []);

  const hideTooltip = useCallback((tooltip: HTMLDivElement) => {
    tooltip.innerHTML = "";
    tooltip.className = `${styles["tooltip"]} ${styles["tooltip-hidden"]}`;
  }, []);

  useEffect(() => {
    if (ttRef.current) {
      if (props.show) {
        showTooltip(ttRef.current, props.rectPos, props.text);
      }
      else {
        hideTooltip(ttRef.current);
      }
    }
  }, [props.show, props.rectPos, props.text, showTooltip, hideTooltip]);

  return (
    <div ref={ttRef} className={`${styles["tooltip"]} ${styles["tooltip-hidden"]}`}></div>
  );
}

export default Tooltip;
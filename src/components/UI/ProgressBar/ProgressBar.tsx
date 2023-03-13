import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./ProgressBar.module.scss";

const BAR_HEIGHT = 12;
const BAR_BORDER_RADIUS = 8;
const TICK_CIRCLE_RADIUS = 12;
const TICK_LABEL_OFFSET = 40;

const ProgressBar = (props: { value: number, min?: number; max: number; tickValues?: number[], tickLabels?: string[]; tickStyle?: string; }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [maxBarWidth, setMaxBarWidth] = useState(0);
  const min = (props.min === undefined) ? 0 : props.min;
  const startX = (props.tickStyle === "circle") ? TICK_CIRCLE_RADIUS : 0;
  const startY = (props.tickStyle === "circle") ? TICK_CIRCLE_RADIUS : BAR_HEIGHT / 2;
  const getXPos = useCallback((value: number) => {
    return ((value - min) / (props.max - min)) * maxBarWidth + startX;
  }, [maxBarWidth, min, props.max, startX]);

  let ticks, tickLabels = null;
  if (props.tickValues) {
    ticks = props.tickValues.map(v => {
      let xPos = getXPos(v);
      let tick = null;
      if (props.tickStyle === "line") {
        if (v !== min && v !== props.max) {
          tick = <line key={v} className={styles["progress-tick"]} x1={xPos} x2={xPos} y1={0} y2={BAR_HEIGHT} />;
        }
      }
      else if (props.tickStyle === "circle") {
        tick = <circle key={v} className={(props.value >= v) ? styles["progress-bar"] : styles["progress-background"]}
          cx={xPos} cy={startY} r={TICK_CIRCLE_RADIUS} />;
      }
      return tick;
    });
    if (props.tickLabels &&
      props.tickValues.length === props.tickLabels.length) {
      tickLabels = props.tickValues.map((v, i) => {
        let xPos = getXPos(v);
        const tickLabel = props.tickLabels ? props.tickLabels[i] : null;
        let textAnchor = "";
        if (v === min) {
          xPos = 0;
          textAnchor = styles["text-anchor-start"];
        }
        else if (v === props.max) {
          xPos = maxBarWidth + 2 * startX;
          textAnchor = styles["text-anchor-end"];
        }
        return <text key={v} x={xPos} y={startY + TICK_LABEL_OFFSET} className={`${styles["progress-tick-label"]} ${textAnchor}`}>{tickLabel}</text>;
      });
    }
  }

  const resizeCallback = useCallback(() => {
    const bbox = svgRef.current?.getBBox();
    const brect = svgRef.current?.getBoundingClientRect();
    if (bbox) {
      svgRef.current?.setAttribute("height", `${bbox.height}`);
    }
    if (brect) {
      setMaxBarWidth(brect.width - 2 * startX);
    }
  }, [svgRef, startX]);

  useLayoutEffect(() => {
    if (svgRef) {
      window.addEventListener("resize", resizeCallback);
      return () => {
        window.removeEventListener("resize", resizeCallback);
      };
    }
  }, [resizeCallback]);

  useEffect(() => {
    if (svgRef) {
      resizeCallback();
    }
  });

  return (
    <svg className={styles["progress"]} ref={svgRef} width="100%">
      <rect className={styles["progress-background"]} x={startX} y={startY - BAR_HEIGHT/2}
        rx={BAR_BORDER_RADIUS} ry={BAR_BORDER_RADIUS} height={BAR_HEIGHT} width={maxBarWidth} />
      <rect className={styles["progress-bar"]} x={startX} y={startY - BAR_HEIGHT/2}
        rx={BAR_BORDER_RADIUS} ry={BAR_BORDER_RADIUS} height={BAR_HEIGHT} width={getXPos(props.value) - startX} />
      {ticks}
      {tickLabels}
    </svg >
  );
};

export default ProgressBar;
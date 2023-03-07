import styles from "./ProgressBar.module.scss";

const ProgressBar = (props: { value: number, min?: number; max: number; tickValues?: number[], tickLabels?: string[]; }) => {
  const min = (props.min === undefined) ? 0 : props.min;
  const getPercent = (value: number) => `${(value * 100 / (props.max - min)).toFixed(3)}%`;
  let ticks, tickLabels = null;
  if (props.tickValues) {
    ticks = props.tickValues.map(v => {
      const xPos = getPercent(v);
      const tick = (v === min || v === props.max) ?
        null :
        <line className={styles["progress-tick"]} x1={xPos} x2={xPos} y1={0} y2={20} />;
      return tick;
    });
    if (props.tickLabels &&
      props.tickValues.length === props.tickLabels.length) {
      tickLabels = props.tickValues.map(v => {
        const xPos = getPercent(v);
        return <text x={xPos} y={30} className={styles["progress-tick-label"]}>{v}</text>;
      });
    }
  }

  return (
    <svg className={styles["progress"]} height={20}>
      <rect className={styles["progress-background"]} rx={10} ry={10} />
      <rect className={styles["progress-bar"]} rx={10} ry={10} width={getPercent(props.value)} />
      {ticks}
      {tickLabels}
    </svg >
  );
};

export default ProgressBar;
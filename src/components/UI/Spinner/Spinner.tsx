import styles from "./Spinner.module.scss";

const Spinner = (props: {hidden?: boolean, displayNone?: boolean, alignCenter?: boolean}) => {
  let className = styles.spinner;
  if (props.hidden) {
    className += " " + styles.hidden;
  }
  if (props.displayNone) {
    className += " " + styles["display-none"];
  }
  return (
    <div className={className}></div>
  );
}

export default Spinner;
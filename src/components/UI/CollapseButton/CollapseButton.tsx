import { MouseEvent, ReactNode } from "react";
import styles from "./CollapseButton.module.scss";

const CollapseButton = (
  props: {
    value: string;
    setValue: (v: string) => void;
    currValue?: string;
    id?: string;
    label?: string;
    content?: ReactNode;
    primary?: boolean;
    secondary?: boolean;
    wide?: boolean;
    disabled?: boolean;
  }) => {
  let className: string;
  if (props.primary) {
    className = styles.primary;
  }
  else if (props.secondary) {
    className = styles.secondary;
  }
  else {
    className = styles.default;
  }

  if (props.wide) {
    className += " " + styles.wide;
  }

  if (props.disabled) {
    className += " " + styles.disabled;
  }

  const checkedClassName = props.currValue === props.value ? styles.checked : "";
  const handleClick = (e: MouseEvent) => {
    if (!props.disabled) {
      props.setValue(props.value);
    }
  };

  return (<div id={props.id} className={`${styles.collapse} ${className} ${checkedClassName}`} onClick={handleClick}>
    <div className={styles.label}>{props.label}</div>
    {props.currValue === props.value &&
      <>
        <div className={styles.content}>
          {props.content}
        </div>
      </>
    }
  </div>
  );
};

export default CollapseButton;
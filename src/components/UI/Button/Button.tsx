import { MouseEvent, MouseEventHandler, ReactNode, useCallback } from "react";
import styles from "./Button.module.scss";

const Button = (props: {
  onClick?: MouseEventHandler;
  primary?: boolean;
  secondary?: boolean;
  wide?: boolean;
  disabled?: boolean;
  href?: string;
  children?: ReactNode;
}) => {
  let className = styles.primary;
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

  const {href, onClick} = props;
  const handleClick = useCallback((e: MouseEvent) => {
    if (href) {
      e.preventDefault();
      window.location.href = href;
    }
    else if (onClick) {
      onClick(e);
    }
  }, [href, onClick]);

  return (
    <button className={`${styles.button} ${className}`} disabled={props.disabled} onClick={handleClick} type="button">
      {props.children}
    </button>
  );
};

export default Button;
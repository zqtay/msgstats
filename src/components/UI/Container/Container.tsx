import { ReactNode } from "react";
import styles from "./Container.module.scss";

const Container = (props: { className?: string; children?: ReactNode; }) => {
  const fullClassName = (props.className) ? `${styles.container} ${props.className}` : styles.container;

  return (
    <div className={fullClassName}>
      {props.children}
    </div>
  );
};

export default Container;
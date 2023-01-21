import styles from "./Container.module.scss";

const Container = (props) => {
  const fullClassName = (!props.className || props.className.length === 0) ? 
    styles.container : `${styles.container} ${props.className}`;
  return (
    <div className={fullClassName}>
      {props.children}
    </div>
  );
}

export default Container;
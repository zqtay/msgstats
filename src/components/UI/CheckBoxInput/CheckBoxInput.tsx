import { ChangeEvent } from "react";
import styles from "./CheckBoxInput.module.scss";

const CheckBoxInput = (props: {
  checked: boolean;
  setChecked: (v: boolean) => void;
  id?: string;
  label?: string;
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.setChecked(e.target.checked);
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        id={props.id}
        type="checkbox"
        checked={props.checked}
        onChange={handleChange}
      />
      {props.id && props.label && <label htmlFor={props.id}>{props.label}</label>}
    </div>
  );
};

export default CheckBoxInput;
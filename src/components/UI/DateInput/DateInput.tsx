import { ChangeEvent, useRef } from "react";
import styles from "./DateInput.module.scss";

const DateInput = (props: {
  date: string;
  setDate: (date: string) => void;
  id?: string;
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.setDate(e.target.value);
  };
  return (
    <div className={styles["box"]} onClick={() => dateInputRef.current?.showPicker()}>
      {props.date}
      <input
        id={props.id}
        type="date"
        className={styles["input"]}
        value={props.date}
        onChange={handleChange}
        ref={dateInputRef}
      />
    </div>
  );
};

export default DateInput;
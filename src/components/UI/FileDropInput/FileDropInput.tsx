import { ChangeEvent, DragEvent, useRef, useState } from "react";
import styles from "./FileDropInput.module.scss";

const FileDropInput = (
  props: {
    setFiles: (files: FileList | null) => void;
    id?: string;
    accept?: string;
    multiple?: boolean;
  }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [numOfFiles, setNumOfFiles] = useState(0);

  const handleDrop = (e: DragEvent) => {
    if (e.dataTransfer && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      props.setFiles(e.dataTransfer.files);
      setNumOfFiles(e.dataTransfer.files.length);
    }
    e.preventDefault();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.setFiles(e.target.files);
    if (e.target.files === null) {
      setNumOfFiles(0);
    }
    else {
      setNumOfFiles(e.target.files.length);
    }
  };

  return (
    <div className={styles["drop-area"]}
      onDragOver={e => e.preventDefault()}
      onDragEnter={e => e.preventDefault()}
      onDrop={e => handleDrop(e)}
      onClick={() => fileInputRef.current?.click()} >
      <div className={styles["text"]}>
        {(numOfFiles === 0) ? `Select or drop files here` : `${numOfFiles} files selected`}
      </div>
      <input
        className={styles["input"]}
        id={props.id}
        accept={props.accept}
        multiple={props.multiple}
        type="file"
        onChange={handleChange}
        ref={fileInputRef}
      />
    </div>
  );
};

export default FileDropInput;
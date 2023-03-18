import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import Button from "../UI/Button/Button";
import Container from "../UI/Container/Container";
import ProgressBar from "../UI/ProgressBar/ProgressBar";
import { ParseStatus } from "../../feature/message-stats/Parser";
import useMsgData, { MsgFilesInput } from '../../feature/message-stats/hooks/useMsgData';
import useStopWords from '../../feature/message-stats/hooks/useStopWords';
import styles from "./Start.module.scss";

type InputFiles = {
  msgApp: string;
  msgDataFiles: FileList | null;
  stopWordsFiles: FileList | null;
};

const guideLinks: { [key: string]: string; } = {
  "telegram": "https://telegram.org/blog/export-and-more"
};

const inputNull: InputFiles = { msgApp: "", msgDataFiles: null, stopWordsFiles: null };

const Start = (props: { step: number; setStep: any; setReportData: any; setShowReport: any; }) => {
  const [input, setInput] = useState<InputFiles>(inputNull);

  const [setMsgFilesInput, msgData, msgDataStatus, clearMsgDataStatus] = useMsgData();
  const [setSwFileList, stopWords, stopWordsStatus] = useStopWords();

  const { step, setStep, setReportData, setShowReport } = props;

  useEffect(() => {
    if (msgDataStatus.state === "success") {
      setReportData((prev: any) => ({ ...prev, msgData: msgData }));
      setShowReport(true);
    }
    if (stopWordsStatus === "success") {
      setReportData((prev: any) => ({ ...prev, stopWords: stopWords }));
    }
  }, [msgDataStatus, stopWordsStatus, msgData, setReportData, setShowReport, stopWords]);

  const handleRestart = useCallback(() => {
    clearMsgDataStatus();
    setInput(inputNull);
    setShowReport(false);
    setStep(1);
  }, [clearMsgDataStatus, setInput, setShowReport, setStep]);

  return (
    <section id="start" className={styles["start-section"]}>
      <Container>
        <div className={styles["start"]}>
          <ProgressBar value={step} min={1} max={4} tickValues={[1, 2, 3, 4]} tickLabels={["Select", "Import", "Process", "View"]} tickStyle="circle" />
          {(step === 1) && <Step1 setStep={setStep} input={input} setInput={setInput} />}
          {(step === 2) && <Step2 setStep={setStep} input={input} setInput={setInput} />}
          {(step === 3) && <Step3 setStep={setStep} input={input} setMsgFilesInput={setMsgFilesInput} msgDataStatus={msgDataStatus} handleRestart={handleRestart} />}
          {(step === 4) && <Step4 handleRestart={handleRestart} />}
        </div>
        {/* <input id="swFileSelect" accept=".txt" multiple type="file" ref={swFileDirRef} /> */}
      </Container>
    </section>
  );
};

const Step1 = (props: {
  setStep: Dispatch<SetStateAction<number>>;
  input: InputFiles;
  setInput: Dispatch<SetStateAction<InputFiles>>;
}) => {
  return <>
    <div className={styles["step-title"]}>Select</div>
    <div className={styles["step-subtitle"]}>Select your messaging app.</div>
    <div className={styles["step-content"]}>
      <input type="radio" id="radio-app-telegram" name="app" value="telegram"
        onChange={e => props.setInput((prev: InputFiles) => ({ ...prev, msgApp: e.target.value }))}
        defaultChecked={props.input.msgApp === "telegram"} />
      <label htmlFor="radio-app-telegram">Telegram</label>
      {
        props.input.msgApp &&
        <div>
          <p>Please follow the link to learn how to export your message history.</p>
          <a href={guideLinks[props.input.msgApp]}>{guideLinks[props.input.msgApp]}</a>
          <p>If you already have your message history (.html) files ready, please proceed to the next step.</p>
        </div>
      }
    </div>
    <div className={styles["step-nav"]}>
      {props.input.msgApp &&
        <Button primary onClick={() => props.setStep(2)}>Next</Button>
      }
    </div>
  </>;
};

const Step2 = (props: {
  setStep: Dispatch<SetStateAction<number>>;
  input: InputFiles;
  setInput: Dispatch<SetStateAction<InputFiles>>;
}) => {
  return <>
    <div className={styles["step-title"]}>Import</div>
    <div className={styles["step-subtitle"]}>Select your exported message history files.</div>
    <div className={styles["step-content"]}>
      <input id="msgFileSelect" accept=".html" multiple type="file"
        onChange={e => props.setInput((prev: InputFiles) => ({ ...prev, msgDataFiles: e.target.files }))} />
      {props.input.msgDataFiles && <p>Click Next to start processing.</p>}
    </div>
    <div className={styles["step-nav"]}>
      {
        props.input.msgDataFiles &&
        <Button primary onClick={() => props.setStep(3)}>Next</Button>
      }
    </div>
  </>;
};

const Step3 = (props: {
  setStep: Dispatch<SetStateAction<number>>;
  input: InputFiles;
  setMsgFilesInput: Dispatch<SetStateAction<MsgFilesInput>>;
  msgDataStatus: ParseStatus;
  handleRestart: () => void;
}) => {
  const max = (props.input.msgDataFiles) ? props.input.msgDataFiles.length : 0;
  const getParseProgress = useCallback((): number => {
    const tmpStatus = props.msgDataStatus.state.split("_");
    if (tmpStatus[0] === "parse") {
      let progNum = parseInt(tmpStatus[1]);
      return isNaN(progNum) ? 0 : progNum;
    }
    else if (props.msgDataStatus.state === "success") {
      return max;
    }
    return 0;
  }, [props.msgDataStatus, max]);

  useEffect(() => {
    if (props.input.msgApp && props.input.msgDataFiles) {
      props.setMsgFilesInput({ app: props.input.msgApp, fileList: props.input.msgDataFiles });
    }
  }, [props.input.msgApp, props.input.msgDataFiles]);

  useEffect(() => {
    if (props.msgDataStatus.state === "success") {
      props.setStep(4);
    }
  }, [props.msgDataStatus.state]);

  return <>
    <div className={styles["step-title"]}>Process</div>
    <div className={styles["step-subtitle"]}>
      {props.msgDataStatus.state === "success" ? "Process complete." : "Processing ..."}
    </div>
    <div className={styles["step-content"]}>
      {(props.msgDataStatus.state.split("_")[0] === "parse" || props.msgDataStatus.state === "success") &&
        <ProgressBar value={getParseProgress()} max={max} />
      }
      {props.msgDataStatus.error &&
        <p>
          {`Error: ${props.msgDataStatus.error} ${props.msgDataStatus.state}`}
        </p>
      }
    </div>
    <div className={styles["step-nav"]}>
      {props.msgDataStatus.error &&
        <ButtonRestart handleRestart={props.handleRestart} />
      }
    </div>
  </>;
};

const Step4 = (props: {
  handleRestart: () => void;
}) => {
  return <>
    <div className={styles["step-title"]}>View</div>
    <div className={styles["step-subtitle"]}>Process completed. The report is ready for viewing.</div>
    <div className={styles["step-nav"]}>
      <Button primary href={`./#report`}>View Report</Button>
      <ButtonRestart handleRestart={props.handleRestart} />
    </div>
  </>;
};

const ButtonRestart = (props: {
  handleRestart: () => void;
}) => {
  return <Button default onClick={props.handleRestart}>Restart</Button>;
};

export default Start;
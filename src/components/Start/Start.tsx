import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import Button from "../UI/Button/Button";
import Container from "../UI/Container/Container";
import ProgressBar from "../UI/ProgressBar/ProgressBar";
import { ParseStatus } from "../../feature/message-stats/Parser";
import useMsgData, { MsgFilesInput } from '../../feature/message-stats/hooks/useMsgData';
import useStopWords from '../../feature/message-stats/hooks/useStopWords';
import styles from "./Start.module.scss";
import CollapseButton from "../UI/CollapseButton/CollapseButton";
import FileDropInput from "../UI/FileDropInput/FileDropInput";
import CheckBoxInput from "../UI/CheckBoxInput/CheckBoxInput";

type InputInfo = {
  msgApp: string;
  msgFiles: FileList | null;
  swFiles: FileList | null;
};

const guideLinks: { [key: string]: string; } = {
  "telegram": "https://telegram.org/blog/export-and-more"
};

const inputNull: InputInfo = { msgApp: "", msgFiles: null, swFiles: null };

const Start = (props: { step: number; setStep: any; setReportData: any; setShowReport: any; }) => {
  const [inputInfo, setInputInfo] = useState<InputInfo>(inputNull);
  const [isUseStopWords, setIsUseStopWords] = useState(false);

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
    setInputInfo(inputNull);
    setShowReport(false);
    setStep(1);
  }, [clearMsgDataStatus, setInputInfo, setShowReport, setStep]);

  return (
    <section id="start" className={styles["start-section"]}>
      <Container className={styles["start-container"]}>
        <ProgressBar value={step} min={1} max={4} tickValues={[1, 2, 3, 4]} tickLabels={["Select", "Import", "Process", "View"]} tickStyle="circle" />
        {(step === 1) && <Step1 setStep={setStep} info={inputInfo} setInfo={setInputInfo} />}
        {(step === 2) && <Step2 setStep={setStep} info={inputInfo} setInfo={setInputInfo}
          isUseSW={isUseStopWords} setIsUseSW={setIsUseStopWords} />}
        {(step === 3) && <Step3 setStep={setStep} info={inputInfo} setMsgFilesInput={setMsgFilesInput} msgDataStatus={msgDataStatus}
          setSwFileList={setSwFileList} handleRestart={handleRestart} />}
        {(step === 4) && <Step4 handleRestart={handleRestart} />}
      </Container>
    </section>
  );
};

const Step1 = (props: {
  setStep: Dispatch<SetStateAction<number>>;
  info: InputInfo;
  setInfo: Dispatch<SetStateAction<InputInfo>>;
}) => {

  const ExportGuide = (props: { msgApp: string; }) => {
    return <>
      Click the link to learn how to export message history.
      <br />
      <a href={guideLinks[props.msgApp]}>{guideLinks[props.msgApp]}</a>
    </>;
  };

  const setMsgApp = (msgApp: string) => props.setInfo((prev: InputInfo) => ({ ...prev, msgApp: msgApp }));

  return <>
    <div className={styles["step-title"]}>Select</div>
    <div className={styles["step-subtitle"]}>Select your messaging app.</div>
    <div className={`${styles["step-content"]} ${styles["app-selection"]}`}>
      <CollapseButton value="telegram" label="Telegram" primary wide
        setValue={setMsgApp}
        currValue={props.info.msgApp}
        content={<ExportGuide msgApp="telegram" />} />
      <CollapseButton value="sample" label="Sample" primary wide
        setValue={setMsgApp}
        currValue={props.info.msgApp}
        content={"Preview with sample data."} />
      {/* <CollapseButton value="whatsapp" label="Whatsapp" primary wide
        setValue={setMsgApp}
        currValue={props.input.msgApp}
        content={<ExportGuide msgApp="whatsapp" />} /> */}
      {props.info.msgApp &&
        <div>
          {props.info.msgApp === "sample" ?
            `Please proceed to the next step.` :
            `If your message history files are ready, please proceed to the next step.`
          }
        </div>
      }
    </div>
    {props.info.msgApp &&
      <div className={styles["step-nav"]}>
        <Button primary wide onClick={() => {
          if (props.info.msgApp === "sample") {
            props.setStep(3);
          }
          else {
            props.setStep(2);
          }
        }}>
          Next
        </Button>
      </div>
    }
  </>;
};

const Step2 = (props: {
  setStep: Dispatch<SetStateAction<number>>;
  info: InputInfo;
  setInfo: Dispatch<SetStateAction<InputInfo>>;
  isUseSW: boolean;
  setIsUseSW: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setStep, info, setInfo, isUseSW, setIsUseSW } = props;

  return <>
    <div className={styles["step-title"]}>Import</div>
    <div className={styles["step-subtitle"]}>Select your exported message history files.</div>
    <div className={styles["step-content"]}>
      <div className={styles["justify-between"]}>
        <span>{isUseSW && `Message files`}</span>
        <CheckBoxInput id="isUseStopWords" label="Use stop words" checked={isUseSW} setChecked={setIsUseSW} />
      </div>
      <div className={styles["file-inputs"]}>
        <FileDropInput id="msgFileSelect" accept=".html" multiple
          setFiles={files => setInfo((prev: InputInfo) => ({ ...prev, msgFiles: files }))} />
        {isUseSW && <FileDropInput id="swFileSelect" accept=".txt" multiple
          setFiles={files => setInfo((prev: InputInfo) => ({ ...prev, swFiles: files }))} />}
      </div>
      {(info.msgFiles && info.msgFiles.length > 0) && <p>Click Next to start processing.</p>}
    </div>
    {((info.msgFiles && info.msgFiles.length > 0)) &&
      <div className={styles["step-nav"]}>
        <Button primary wide onClick={() => setStep(3)}>Next</Button>
      </div>
    }
  </>;
};

const Step3 = (props: {
  setStep: Dispatch<SetStateAction<number>>;
  info: InputInfo;
  setMsgFilesInput: Dispatch<SetStateAction<MsgFilesInput>>;
  msgDataStatus: ParseStatus;
  setSwFileList: Dispatch<SetStateAction<FileList | null>>;
  handleRestart: () => void;
}) => {
  const { setStep, info, setMsgFilesInput, msgDataStatus, setSwFileList, handleRestart } = props;
  const max = (info.msgFiles) ? info.msgFiles.length : 0;
  const getParseProgress = useCallback((): number => {
    const tmpStatus = msgDataStatus.state.split("_");
    if (tmpStatus[0] === "parse") {
      let progNum = parseInt(tmpStatus[1]);
      return isNaN(progNum) ? 0 : progNum;
    }
    else if (msgDataStatus.state === "success") {
      return max;
    }
    return 0;
  }, [msgDataStatus, max]);

  useEffect(() => {
    if (info.msgApp) {
      if (info.msgApp === "sample") {
        setMsgFilesInput({ app: info.msgApp, fileList: null });
      }
      else if (info.msgFiles) {
        setMsgFilesInput({ app: info.msgApp, fileList: info.msgFiles });
        if (info.swFiles) {
          setSwFileList(info.swFiles);
        }
      }
    }
  }, [info, setMsgFilesInput, setSwFileList]);

  useEffect(() => {
    if (msgDataStatus.state === "success") {
      setStep(4);
    }
  }, [msgDataStatus.state, setStep]);

  return <>
    <div className={styles["step-title"]}>Process</div>
    <div className={styles["step-subtitle"]}>
      {msgDataStatus.state === "success" ? "Process complete." : "Processing ..."}
    </div>
    <div className={styles["step-content"]}>
      {(info.msgApp !== "sample") &&
        (msgDataStatus.state.split("_")[0] === "parse" || msgDataStatus.state === "success") &&
        <ProgressBar value={getParseProgress()} max={max} />
      }
      {msgDataStatus.error &&
        <p>
          {`Error: ${msgDataStatus.error} ${msgDataStatus.state}`}
        </p>
      }
    </div>
    {msgDataStatus.error &&
      <div className={styles["step-nav"]}>
        <ButtonRestart handleRestart={handleRestart} />
      </div>
    }
  </>;
};

const Step4 = (props: {
  handleRestart: () => void;
}) => {
  return <>
    <div className={styles["step-title"]}>View</div>
    <div className={styles["step-subtitle"]}>Process completed. The report is ready for viewing.</div>
    <div className={styles["step-nav"]}>
      <ButtonRestart handleRestart={props.handleRestart} />
      <Button primary wide href={`./#report`}>View Report</Button>
    </div>
  </>;
};

const ButtonRestart = (props: {
  handleRestart: () => void;
}) => {
  return <Button wide onClick={props.handleRestart}>Restart</Button>;
};

export default Start;
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import Button from "../UI/Button/Button";
import ProgressBar from "../UI/ProgressBar/ProgressBar";
import useMsgData from '../../feature/message-stats/hooks/useMsgData';
import useStopWords from '../../feature/message-stats/hooks/useStopWords';
import styles from "./Start.module.scss";
import Container from "../UI/Container/Container";

type InputFiles = {
  msgApp: string,
  msgDataFiles: FileList | null,
  stopWordsFiles: FileList | null;
};

const Start = (props: { setReportData: any, setShowReport: any; }) => {
  const [step, setStep] = useState<number>(0);
  const [input, setInput] = useState<InputFiles>({ msgApp: "", msgDataFiles: null, stopWordsFiles: null });

  const [setMsgApp, setMsgFileList, msgData, msgDataStatus] = useMsgData();
  const [setSwFileList, stopWords, stopWordsStatus] = useStopWords();

  useEffect(() => {
    if (msgDataStatus === "success") {
      props.setReportData((prev: any) => ({ ...prev, msgData: msgData }));
      props.setShowReport(true);
    }
    if (stopWordsStatus === "success") {
      props.setReportData((prev: any) => ({ ...prev, stopWords: stopWords }));
    }
  }, [msgDataStatus, stopWordsStatus]);

  return (
    <section id="start" className={styles["start"]}>
      <Container>
        <div className={styles["start-panel"]}>
          {(step === 0) && <Step0 setStep={setStep} />}
          {(step === 1) && <Step1 setStep={setStep} input={input} setInput={setInput} />}
          {(step === 2) && <Step2 setStep={setStep} />}
          {(step === 3) && <Step3 setStep={setStep} input={input} setInput={setInput} />}
          {(step === 4) && <Step4 input={input} setMsgApp={setMsgApp} setMsgFileList={setMsgFileList} msgDataStatus={msgDataStatus} />}
        </div>
        {/* <input id="swFileSelect" accept=".txt" multiple type="file" ref={swFileDirRef} /> */}
      </Container>
    </section>
  );
};

const Step0 = (props: { setStep: Dispatch<SetStateAction<number>>; }) => {
  return <>
    <h1>MsgStats</h1>
    <p>Transform your message history into meaningful statistics.</p>
    <Button primary onClick={() => props.setStep(1)}>
      Start
    </Button>
  </>;
};

const Step1 = (props: { setStep: Dispatch<SetStateAction<number>>, input: InputFiles, setInput: Dispatch<SetStateAction<InputFiles>>; }) => {
  return <>
    <h1>App</h1>
    <p>Select your messaging app.</p>
    <div>
      <input type="radio" id="radio-app-telegram" name="app" value="telegram"
        onChange={e => props.setInput((prev: InputFiles) => ({ ...prev, msgApp: e.target.value }))}></input>
      <label htmlFor="radio-app-telegram">Telegram</label>
      {/* <input type="radio" id="radio-app-whatsapp" name="app" value="whatsapp"></input>
      <label htmlFor="radio-app-whatsapp">WhatsApp</label> */}
    </div>
    {props.input.msgApp &&
      <Button primary onClick={() => props.setStep(2)}>
        Next
      </Button>
    }
  </>;
};

const Step2 = (props: { setStep: Dispatch<SetStateAction<number>>; }) => {
  return <>
    <h1>Export</h1>
    <p>Please follow the link to learn how to export your message history.</p>
    <a href={"https://telegram.org/blog/export-and-more"}>{"https://telegram.org/blog/export-and-more"}</a>
    <p>If you already have your message history (.html) files ready, please proceed to the next step.</p>
    <Button secondary onClick={() => props.setStep(1)}>
      Back
    </Button>
    <Button primary onClick={() => props.setStep(3)}>
      Next
    </Button>
  </>;
};

const Step3 = (props: {
  setStep: Dispatch<SetStateAction<number>>;
  input: InputFiles,
  setInput: Dispatch<SetStateAction<InputFiles>>;
}) => {
  return <>
    <h1>Locate</h1>
    <div>
      <p>Locate the directory of your message history files.</p>
      <input id="msgFileSelect" accept=".html" multiple type="file"
        onChange={e => props.setInput((prev: InputFiles) => ({ ...prev, msgDataFiles: e.target.files }))} />
      {props.input.msgDataFiles && <p>Click Next to start processing.</p>}
    </div>
    <Button secondary onClick={() => props.setStep(2)}>
      Back
    </Button>
    {props.input.msgDataFiles &&
      <Button primary onClick={() => props.setStep(4)}>
        Next
      </Button>
    }
  </>;
};

const Step4 = (props: {
  input: InputFiles,
  setMsgApp: Dispatch<SetStateAction<string>>,
  setMsgFileList: Dispatch<SetStateAction<FileList | null>>,
  msgDataStatus: string,
}) => {
  const max = (props.input.msgDataFiles) ? props.input.msgDataFiles.length : 0;
  const getParseProgress = useCallback((): number => {
    const tmpStatus = props.msgDataStatus.split("_");
    if (tmpStatus[0] === "parse") {
      let progNum = parseInt(tmpStatus[1]);
      return isNaN(progNum) ? 0 : progNum;
    }
    else if (props.msgDataStatus === "success") {
      return max;
    }
    return 0;
  }, [props.msgDataStatus, max]);

  useEffect(() => {
    if (props.input.msgApp && props.input.msgDataFiles) {
      props.setMsgApp(props.input.msgApp);
      props.setMsgFileList(props.input.msgDataFiles);
    }
  }, [props.input.msgApp, props.input.msgDataFiles]);

  return <>
    <h1>Process</h1>
    <div>
      <p>
        {props.msgDataStatus === "success" ? "Process complete." : "Processing ..."}
      </p>
      {(props.msgDataStatus.split("_")[0] === "parse" || props.msgDataStatus === "success") &&
        <ProgressBar value={getParseProgress()} max={max} />
      }
    </div>
  </>;
};

export default Start;
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from "../UI/Button/Button";
import ProgressBar from "../UI/ProgressBar/ProgressBar";
import useMsgData from '../../feature/message-stats/hooks/useMsgData';
import useStopWords from '../../feature/message-stats/hooks/useStopWords';
import styles from "./Start.module.scss";
import Container from "../UI/Container/Container";

const Start = (props: { setReportData: any, setShowReport: any; }) => {
  const [step, setStep] = useState(0);
  const [inputFiles, setInputFiles] = useState({ msgData: null, stopWords: null });

  const [setMsgFileList, msgData, , msgDataStatus] = useMsgData();
  const [setSwFileList, stopWords, , stopWordsStatus] = useStopWords();

  useEffect(() => {
    if (msgDataStatus === "success") {
      props.setReportData((prev: any) => ({ ...prev, msgData: msgData }));
      props.setShowReport(true);
    }
    if (stopWordsStatus === "success") {
      props.setReportData((prev: any) => ({ ...prev, stopWords: stopWords }));
    }
  }, [msgDataStatus, stopWordsStatus]);

  const parseFiles = () => {
    if (inputFiles.msgData) {
      setMsgFileList(inputFiles.msgData);
    }
    // if (swFileDirRef !== null) {
    //   setSwFileList(swFileDirRef.current.files);
    // }
  };

  return (
    <section id="start" className={styles["start"]}>
      <Container>
        {(step === 0) && <Step0 setStep={setStep} />}
        {(step === 1) && <Step1 setStep={setStep} />}
        {(step === 2) && <Step2 setStep={setStep} />}
        {(step === 3) && <Step3 setStep={setStep} setInputFiles={setInputFiles} />}
        {(step === 4) && <Step4 inputFiles={inputFiles} setMsgFileList={setMsgFileList} msgDataStatus={msgDataStatus} />}
        {/* <input id="swFileSelect" accept=".txt" multiple type="file" ref={swFileDirRef} /> */}
      </Container>
    </section>
  );
};

const Step0 = (props: { setStep: any; }) => {
  return <div>
    <h1>MsgStats</h1>
    <p>Transform your message history into meaningful statistics.</p>
    <Button primary onClick={() => props.setStep(1)}>
      Start
    </Button>
  </div>;
};

const Step1 = (props: { setStep: any; }) => {
  return <div>
    <h1>App</h1>
    <p>Select your messaging app.</p>
    <input type="radio" id="css" name="fav_language" value="CSS"></input>
    <input type="radio" id="css1" name="fav_language1" value="CSS1"></input>
    <Button primary onClick={() => props.setStep(2)}>
      Next
    </Button>
  </div>;
};

const Step2 = (props: { setStep: any; }) => {
  return <div>
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
  </div>;
};

const Step3 = (props: { setStep: any; setInputFiles: any; }) => {
  return <div>
    <h1>Locate</h1>
    <p>Locate the directory of your message history files.</p>
    <input id="msgFileSelect" accept=".html" multiple type="file"
      onChange={e => props.setInputFiles((prev: any) => ({...prev, msgData: e.target.files}))} />
    <p>Click Next to start processing.</p>
    <Button secondary onClick={() => props.setStep(2)}>
      Back
    </Button>
    <Button primary onClick={() => props.setStep(4)}>
      Next
    </Button>
  </div>;
};

const Step4 = (props: { inputFiles: any, setMsgFileList: any, msgDataStatus: string, }) => {
  useEffect(() => {
    console.log(props.inputFiles);
    if (props.inputFiles.msgData) {
      props.setMsgFileList(props.inputFiles.msgData);
    }
  }, [props.inputFiles.msgData]);
  const getParseProgress = useCallback((): number => {
    const tmpStatus = props.msgDataStatus.split("_");
    if (tmpStatus[0] === "parse") {
      let progNum = parseInt(tmpStatus[1]);
      return isNaN(progNum) ? 0 : progNum;
    }
    else if (props.msgDataStatus === "success") {
      return props.inputFiles.msgData.length;
    }
    return 0;
  }, [props.msgDataStatus]);

  return <div>
    <h1>Process</h1>
    <p>Please wait ...</p>
    {(props.msgDataStatus.split("_")[0] === "parse" || props.msgDataStatus === "success") &&
      <ProgressBar value={getParseProgress()} max={props.inputFiles.msgData.length} />
    }
  </div>;
};

export default Start;
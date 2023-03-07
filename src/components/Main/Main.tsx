import { useCallback, useEffect, useRef, useState } from 'react';
import Container from "../UI/Container/Container";
import Button from "../UI/Button/Button";
import ProgressBar from "../UI/ProgressBar/ProgressBar";

import useMsgData from '../../feature/message-stats/hooks/useMsgData';
import useStopWords from '../../feature/message-stats/hooks/useStopWords';
import Report from "../Report/Report";


const Main = () => {
  const [msgFileList, setMsgFileList] = useState(null);
  const [swFileList, setSwFileList] = useState(null);
  const [showReport, setShowReport] = useState(false);
  let msgFileDirRef: any = useRef(null);
  let swFileDirRef: any = useRef(null);

  const [msgData, , msgDataStatus] = useMsgData(msgFileList);
  const [stopWords, , stopWordsStatus] = useStopWords(swFileList);

  useEffect(() => {
    if (msgDataStatus === "success") {
      setShowReport(true);
    }
  }, [msgDataStatus]);

  const parseFiles = () => {
    if (msgFileDirRef !== null) {
      setMsgFileList(msgFileDirRef.current.files);
    }
    if (swFileDirRef !== null) {
      setSwFileList(swFileDirRef.current.files);
    }
  };

  const getParseProgress = useCallback((): number => {
    const tmpStatus = msgDataStatus.split("_");
    if (tmpStatus[0] === "parse") {
      let progNum = parseInt(tmpStatus[1]);
      return isNaN(progNum) ? 0 : progNum;
    }
    else if (msgDataStatus === "success") {
      return msgFileDirRef.current.files.length;
    }
    return 0;
  }, [msgDataStatus]);

  return (
    <main>
      <Container>
        {(msgDataStatus.split("_")[0] === "parse" || msgDataStatus === "success") &&
          <ProgressBar value={getParseProgress()} max={msgFileDirRef.current.files.length} />
        }
        <h2>MsgData status: {msgDataStatus}</h2>
        <h2>StopWords status: {stopWordsStatus}</h2>

        <input id="msgFileSelect" accept=".html" multiple type="file" ref={msgFileDirRef} />
        <input id="swFileSelect" accept=".txt" multiple type="file" ref={swFileDirRef} />
        <Button primary onClick={parseFiles}>
          Start
        </Button>
        <Report show={showReport} msgData={msgData} stopWords={stopWords} />
      </Container>
    </main>
  );
};

export default Main;
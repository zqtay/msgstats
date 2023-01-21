import { useCallback, useEffect, useRef, useState } from 'react';
import Container from "../UI/Container/Container";
import Button from "../UI/Button/Button";
import ProgressBar from "../UI/ProgressBar/ProgressBar";

import useMsgData from '../../feature/message-stats/hooks/useMsgData';
import useStopWords from '../../feature/message-stats/hooks/useStopWords';
import CalHeatMap from "../CalHeatMap/CalHeatMap";

const InputPanel = () => {
  const [msgFileList, setMsgFileList] = useState(null);
  const [swFileList, setSwFileList] = useState(null);
  const [statusText, setStatusText] = useState("");
  let msgFileDirRef: any = useRef(null);
  let swFileDirRef: any = useRef(null);

  const [msgCount, setMsgCount] = useState<{ [key: string]: { [key: string]: number; }; } | null>(null);

  const [msgData, , msgDataStatus] = useMsgData(msgFileList);
  const [stopWords, , stopWordsStatus] = useStopWords(swFileList);

  const parseFiles = () => {
    if (msgFileDirRef !== null) {
      setMsgFileList(msgFileDirRef.current.files);
    }
    if (swFileDirRef !== null) {
      setSwFileList(swFileDirRef.current.files);
    }
  };

  const getWordFreq = () => {
    if (msgData !== null) {
      let wordFreq = msgData.stats.getMostUsedWords(msgData, 1000, stopWords?.check.bind(stopWords));
      setStatusText(JSON.stringify(wordFreq).slice(0, 1000));
      console.log(wordFreq);
    }
  };

  const getMsgCount = () => {
    if (msgData !== null) {
      let msgCount1 = msgData.stats.getDailyMsgCount(msgData);
      setStatusText(JSON.stringify(msgCount1).slice(0, 1000));
      setMsgCount(msgCount1);
      console.log(msgCount1);
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

  const getMsgStats = () => {
    if (msgData !== null) {
      let stats = msgData.stats.getMsgStats(msgData);
      setStatusText(JSON.stringify(stats).slice(0, 1000));
      console.log(stats);
    }
  };

  return (
    <Container>

      {(msgDataStatus.split("_")[0] === "parse" || msgDataStatus === "success") &&
        <ProgressBar primary value={getParseProgress()} max={msgFileDirRef.current.files.length} />
      }
      <h2>MsgData status: {msgDataStatus}</h2>
      <h2>StopWords status: {stopWordsStatus}</h2>
      <p>{statusText}</p>

      <input id="msgFileSelect" accept=".html" multiple type="file" ref={msgFileDirRef} />
      <input id="swFileSelect" accept=".txt" multiple type="file" ref={swFileDirRef} />
      <Button primary onClick={parseFiles}>
        Start
      </Button>
      <button onClick={() => getWordFreq()}>WORD FREQ</button>
      <button onClick={() => getMsgCount()}>MSG COUNT</button>
      <button onClick={() => getMsgStats()}>STATS</button>
      {msgCount && <CalHeatMap data={msgCount}></CalHeatMap>}
    </Container>
  );
};

export default InputPanel;
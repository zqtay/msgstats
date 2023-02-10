import { useCallback, useEffect, useRef, useState } from 'react';
import Container from "../UI/Container/Container";
import Button from "../UI/Button/Button";
import ProgressBar from "../UI/ProgressBar/ProgressBar";

import useMsgData from '../../feature/message-stats/hooks/useMsgData';
import useStopWords from '../../feature/message-stats/hooks/useStopWords';
import CalHeatMap from "../CalHeatMap/CalHeatMap";
import DonutChart from "../DonutChart/DonutChart";

const Main = () => {
  const [msgFileList, setMsgFileList] = useState(null);
  const [swFileList, setSwFileList] = useState(null);
  const [statusText, setStatusText] = useState("");
  let msgFileDirRef: any = useRef(null);
  let swFileDirRef: any = useRef(null);

  const [msgCount, setMsgCount] = useState<{ [key: string]: { [key: string]: number; }; } | null>(null);
  const [msgStats, setMsgStats] = useState<{ [key: string]: number; } | null>(null);

  const [msgData, , msgDataStatus] = useMsgData(msgFileList);
  const [stopWords, , stopWordsStatus] = useStopWords(swFileList);

  useEffect(() => {
    if (msgDataStatus === "success") {
      getWordFreq();
      getMsgCount();
      getMsgStats();
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

  const getWordFreq = () => {
    if (msgData !== null) {
      let wordFreq = msgData.stats.getMostUsedWords(1000, stopWords?.check.bind(stopWords));
      setStatusText(JSON.stringify(wordFreq).slice(0, 1000));
      console.log(wordFreq);
    }
  };

  const getMsgCount = () => {
    if (msgData !== null) {
      let msgCount1 = msgData.stats.getDailyMsgCount();
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
      let stats = msgData.stats.getMsgStats();
      setStatusText(JSON.stringify(stats).slice(0, 1000));
      let totMsgCount: { [key: string]: number; } = {};
      Object.keys(stats).forEach(name => totMsgCount[name] = stats[name]["totMsgCount"]);
      setMsgStats(totMsgCount);
    }
  };

  return (
    <main>
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
        {msgCount && <CalHeatMap data={msgCount} dateStart={"2018-01-20"} dateEnd={"2019-01-01"}></CalHeatMap>}
        {msgStats && <DonutChart data={msgStats}></DonutChart>}
      </Container>
    </main>
  );
};

export default Main;
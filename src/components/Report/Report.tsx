import CalHeatMap from "../CalHeatMap/CalHeatMap";
import DonutChart from "../DonutChart/DonutChart";
import MsgData from "../../feature/message-stats/MsgData";
import StopWords from "../../feature/message-stats/StopWords";

import { useEffect, useState } from 'react';

const Report = (props: {show: boolean, msgData: MsgData | null, stopWords: StopWords | null}) => {

  const [msgCount, setMsgCount] = useState<{ [key: string]: { [key: string]: number; }; } | null>(null);
  const [msgStats, setMsgStats] = useState<{ [key: string]: { [key: string]: number; }; } | null>(null);
  const [dateRange, setDateRange] = useState({});

  useEffect(() => {
    if (props.show) {
      getWordFreq();
      getMsgCount();
      getMsgStats();
    }
  }, [props.show, props.msgData, props.stopWords])

  const getWordFreq = () => {
    if (props.msgData) {
      let wordFreq = props.msgData.stats.getMostUsedWords(1000, props.stopWords?.check.bind(props.stopWords));
    }
  };

  const getMsgCount = () => {
    if (props.msgData) {
      let msgCount1 = props.msgData.stats.getDailyMsgCount();
      setMsgCount(msgCount1);
    }
  };

  const getMsgStats = () => {
    if (props.msgData) {
      let stats = props.msgData.stats.getMsgStats();
      let totMsgCount: { [key: string]: number; } = {};
      let totCharCount: { [key: string]: number; } = {};
      Object.keys(stats).forEach(name => totMsgCount[name] = stats[name]["totMsgCount"]);
      Object.keys(stats).forEach(name => totCharCount[name] = stats[name]["totCharCount"]);
      setMsgStats(prev => ({...prev, totMsgCount: totMsgCount}));
      setMsgStats(prev => ({...prev, avgCharCountPerMsg: totCharCount}));
    }
  };

  const handleDateChange = (e: any) => {
    if (props.msgData) { 
      props.msgData.stats.setDateRange(e.target.value);
      getWordFreq();
      getMsgCount();
      getMsgStats();
    }
  };

  return (
    <>
    {props.show &&
      <div>
        <input type="date" onChange={handleDateChange}></input>
        {msgCount && <CalHeatMap data={msgCount}></CalHeatMap>}
        {msgStats && <DonutChart data={msgStats.totMsgCount}></DonutChart>}
        {msgStats && <DonutChart data={msgStats.avgCharCountPerMsg}></DonutChart>}
      </div>
    }
    </>
  );
};

export default Report;
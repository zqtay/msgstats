import CalHeatMap from "../CalHeatMap/CalHeatMap";
import DonutChart from "../DonutChart/DonutChart";
import MsgData from "../../feature/message-stats/MsgData";
import StopWords from "../../feature/message-stats/StopWords";

import { useEffect, useState } from 'react';

type Stats = { [key: string]: { [key: string]: number; }; };
type WordFreq = { [key: string]: { [key: string]: number; }[]; };

const Report = (props: { show: boolean, msgData: MsgData | null, stopWords: StopWords | null; }) => {

  const [msgCount, setMsgCount] = useState<Stats | null>(null);
  const [msgStats, setMsgStats] = useState<Stats | null>(null);
  const [wordFreq, setWordFreq] = useState<WordFreq | null>(null);
  const [dateRange, setDateRange] = useState({});

  useEffect(() => {
    if (props.show) {
      getWordFreq();
      getMsgCount();
      getMsgStats();
    }
  }, [props.show, props.msgData, props.stopWords]);

  const getWordFreq = () => {
    if (props.msgData) {
      let wordFreq1 = props.msgData.stats.getMostUsedWords(20, props.stopWords?.check.bind(props.stopWords));
      setWordFreq(wordFreq1);
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
      setMsgStats(prev => ({ ...prev, totMsgCount: totMsgCount }));
      setMsgStats(prev => ({ ...prev, totCharCount: totCharCount }));
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
          {msgStats && <DonutChart data={msgStats.totCharCount}></DonutChart>}
          {wordFreq && <WordFreqTable wordFreq={wordFreq} />}
        </div>
      }
    </>
  );
};

const WordFreqTable = (props: { wordFreq: WordFreq; }) => {
  let users = Object.keys(props.wordFreq);
  const Table = (props: { user: string, words: { [key: string]: number; }[]; }) => {
    return (
      <table>
        <th>{props.user}</th>
        {props.words
          .map(e => (<tr><td>{Object.keys(e)[0]}</td><td>{Object.values(e)[0]}</td></tr>))
        }
      </table>
    );
  };

  return (
    <div>
      {users.map(user => <Table user={user} words={props.wordFreq[user]} />)}
    </div>
  );
};

export default Report;
import CalHeatMap from "../Charts/CalHeatMap/CalHeatMap";
import DonutChart from "../Charts/DonutChart/DonutChart";
import MsgData from "../../feature/message-stats/MsgData";
import StopWords from "../../feature/message-stats/StopWords";
import styles from "./Report.module.scss";
import { useEffect, useState } from 'react';

type SimpleData = { [key: string]: number; };
type MsgStatsData = { [key: string]: { [key: string]: number; }; };
type WordFreqData = { [key: string]: { [key: string]: number; }[]; };

const Report = (props: { show: boolean, msgData: MsgData | null, stopWords: StopWords | null; }) => {

  const [msgCount, setMsgCount] = useState<MsgStatsData | null>(null);
  const [msgStats, setMsgStats] = useState<MsgStatsData | null>(null);
  const [wordFreq, setWordFreq] = useState<WordFreqData | null>(null);
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
      let totMsgCount: SimpleData = {};
      let totCharCount: SimpleData = {};
      let avgCharCountPerMsg: SimpleData = {};
      Object.keys(stats).forEach(name => totMsgCount[name] = stats[name]["totMsgCount"]);
      Object.keys(stats).forEach(name => totCharCount[name] = stats[name]["totCharCount"]);
      Object.keys(stats).forEach(name => avgCharCountPerMsg[name] = stats[name]["avgCharCountPerMsg"]);
      setMsgStats(prev => ({ ...prev, totMsgCount: totMsgCount }));
      setMsgStats(prev => ({ ...prev, totCharCount: totCharCount }));
      setMsgStats(prev => ({ ...prev, avgCharCountPerMsg: avgCharCountPerMsg }));
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
        <section className={styles["report"]}>
          <input type="date" onChange={handleDateChange}></input>
          {msgCount && <CalHeatMap data={msgCount}></CalHeatMap>}
          <div className={styles["msg-stats-charts"]}>
            {msgStats &&
              <>
                <MsgStatsChart title="Total Message Count" data={msgStats.totMsgCount} />
                <MsgStatsChart title="Total Character Count" data={msgStats.totCharCount} />
                <MsgStatsChart title="Average Character Count Per Message" data={msgStats.avgCharCountPerMsg} />
              </>
            }
          </div>
          {wordFreq && <WordFreqTable wordFreq={wordFreq} />}
        </section>
      }
    </>
  );
};

const WordFreqTable = (props: { wordFreq: WordFreqData; }) => {
  let users = Object.keys(props.wordFreq);
  const Table = (props: { user: string, words: SimpleData[]; }) => {
    return (
      <div>
        <h5>{props.user}</h5>
        <table>
          <tbody>
            {props.words
              .map((e, i) => (
                <tr key={i}>
                  <td>{Object.keys(e)[0]}</td>
                  <td>{Object.values(e)[0]}</td>
                </tr>)
              )
            }
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {users.map(user => <Table key={user} user={user} words={props.wordFreq[user]} />)}
    </div>
  );
};

const MsgStatsChart = (props: { title: string, data: SimpleData; }) => {
  return (
    <div className={styles["msg-stats-chart-container"]}>
      <h3>{props.title}</h3>
      <DonutChart data={props.data}></DonutChart>
    </div>
  );
};

export default Report;
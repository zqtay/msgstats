import CalHeatMap from "../Charts/CalHeatMap/CalHeatMap";
import DonutChart from "../Charts/DonutChart/DonutChart";
import MsgData from "../../feature/message-stats/MsgData";
import StopWords from "../../feature/message-stats/StopWords";
import styles from "./Report.module.scss";
import { ReactNode, useEffect, useState } from 'react';
import LineChart from "../Charts/LineChart/LineChart";

type SimpleData = { [key: string]: number; };
type MsgStatsData = { [key: string]: { [key: string]: number; }; };
type WordFreqData = { [key: string]: { [key: string]: number; }[]; };
type HourlyMsgData = { [key: string]: [number, number][]; };

const Report = (props: { show: boolean, msgData: MsgData | null, stopWords: StopWords | null; }) => {

  const [msgCount, setMsgCount] = useState<MsgStatsData | null>(null);
  const [msgStats, setMsgStats] = useState<MsgStatsData | null>(null);
  const [wordFreq, setWordFreq] = useState<WordFreqData | null>(null);
  const [hourlyMsg, setHourlyMsg] = useState<HourlyMsgData | null>(null);
  const [dateRange, setDateRange] = useState({});

  useEffect(() => {
    if (props.show) {
      getWordFreq();
      getMsgCount();
      getMsgStats();
      getHourlyMsg();
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

  const getHourlyMsg = () => {
    if (props.msgData) {
      let stats = props.msgData.stats.getHourlyMsgCount();
      const formattedData: HourlyMsgData = {};
      Object.entries(stats).forEach(e => {
        formattedData[e[0]] = e[1].map((y, x) => [x, y]);
      });
      setHourlyMsg(formattedData);
    }
  };

  const handleDateChange = (e: any) => {
    if (props.msgData) {
      props.msgData.stats.setDateRange(e.target.value);
      getWordFreq();
      getMsgCount();
      getMsgStats();
      getHourlyMsg();
    }
  };

  return (
    <>
      {props.show &&
        <section className={styles["report"]}>
          <input type="date" onChange={handleDateChange}></input>
          <div className={styles["msgstats-charts"]}>
            {msgStats &&
              <>
                <ChartContainer title="Total Message Count">
                  <DonutChart data={msgStats.totMsgCount} />
                </ChartContainer>
                <ChartContainer title="Total Character Count">
                  <DonutChart data={msgStats.totCharCount} />
                </ChartContainer>
                <ChartContainer title="Average Character Count Per Message">
                  <DonutChart data={msgStats.avgCharCountPerMsg} />
                </ChartContainer>
              </>
            }
          </div>
          {hourlyMsg &&
            <ChartContainer title="Average Hourly Message Count">
              <LineChart data={hourlyMsg} xTicks={24} xLabel={"Time of Day"} yLabel={"Number of Messages"} />
            </ChartContainer>
          }
          {msgCount &&
            <ChartContainer title="Daily Message Count">
              <CalHeatMap data={msgCount} />
            </ChartContainer>
          }
          {wordFreq && <WordFreqTable title="Most Used Words" wordFreq={wordFreq} />}
        </section>
      }
    </>
  );
};

const WordFreqTable = (props: { title: string, wordFreq: WordFreqData; }) => {
  let users = Object.keys(props.wordFreq);
  const Table = (props: { user: string, words: SimpleData[]; }) => {
    return (
      <div className={styles["wordfreq-table"]}>
        <div className={styles["wordfreq-table-user"]}>{props.user}</div>
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
    <div className={styles["wordfreq-tables-container"]}>
      <div className={styles["chart-title"]}>{props.title}</div>
      <div className={styles["wordfreq-tables"]}>
        {users.map(user => <Table key={user} user={user} words={props.wordFreq[user]} />)}
      </div>
    </div>
  );
};

const ChartContainer = (props: { title: string, children: ReactNode; }) => {
  return (
    <div className={styles["chart-container"]}>
      <div className={styles["chart-title"]}>{props.title}</div>
      {props.children}
    </div>
  );
};

export default Report;
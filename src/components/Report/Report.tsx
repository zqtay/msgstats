import { ReactNode, useEffect, useReducer, useRef } from 'react';

import MsgStats, { DailyCount, WordFreqList } from "../../feature/message-stats/MsgStats";
import MsgStatsStatic, { MsgStatsObject } from "../../feature/message-stats/MsgStatsStatic";
import StopWords from "../../feature/message-stats/StopWords";
import Util from "../../feature/message-stats/Util";

import CalHeatMap from "../Charts/CalHeatMap/CalHeatMap";
import DonutChart from "../Charts/DonutChart/DonutChart";
import LineChart from "../Charts/LineChart/LineChart";
import Button from "../UI/Button/Button";
import Container from "../UI/Container/Container";
import DateInput from "../UI/DateInput/DateInput";

import styles from "./Report.module.scss";
import Spinner from "../UI/Spinner/Spinner";

type SimpleData = { [key: string]: number; };
type MsgStatsData = { [key: string]: { [key: string]: number; }; };
type HourlyCount = { [key: string]: [number, number][]; };
enum ActionType {
  HOURLY_COUNT = 1,
  DAILY_COUNT,
  TOTAL_STATS,
  WORD_FREQ,
  DATE_RANGE,
  MIN_TITLE,
  SHARE_LINK,
  SHARE_PROGRESS
};
interface ReportState {
  hourlyCount: HourlyCount | null;
  dailyCount: DailyCount | null;
  totalStats: MsgStatsData | null;
  wordFreq: WordFreqList | null;
  dateRange: string[];
  minTitle: boolean;
  shareLink: string | null;
  shareProgress: boolean;
};
interface ReportAction {
  type: ActionType;
  data: any;
};

const initialState: ReportState = {
  hourlyCount: null,
  dailyCount: null,
  totalStats: null,
  wordFreq: null,
  dateRange: ["", ""],
  minTitle: false,
  shareLink: null,
  shareProgress: false
};

const Report = (props: { show: boolean, isStatic: boolean, msgStats: MsgStats | null, stopWords: StopWords | null; }) => {
  const reducer = (state: ReportState, action: ReportAction): ReportState => {
    let { type, data } = action;
    switch (type) {
      case ActionType.HOURLY_COUNT:
        return { ...state, hourlyCount: (data as HourlyCount) };
      case ActionType.DAILY_COUNT:
        return { ...state, dailyCount: (data as DailyCount) };
      case ActionType.TOTAL_STATS:
        return { ...state, totalStats: (data as MsgStatsData) };
      case ActionType.WORD_FREQ:
        return { ...state, wordFreq: (data as WordFreqList) };
      case ActionType.DATE_RANGE:
        return { ...state, dateRange: (data as string[]) };
      case ActionType.MIN_TITLE:
        return { ...state, minTitle: (data as boolean) };
      case ActionType.SHARE_LINK:
        return { ...state, shareLink: (data as string) };
      case ActionType.SHARE_PROGRESS:
        return { ...state, shareProgress: (data as boolean) };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const { hourlyCount, dailyCount, totalStats, wordFreq, dateRange, minTitle, shareLink, shareProgress } = state;
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.show && props.msgStats) {
      getMostUsedWords();
      getDailyCount();
      getTotalCountStats();
      getHourlyMsg();
      dispatch({ type: ActionType.DATE_RANGE, data: props.msgStats.getDateRange() });
      dispatch({ type: ActionType.SHARE_LINK, data: null });
      dispatch({ type: ActionType.SHARE_PROGRESS, data: false });
    }
  }, [props.show, props.msgStats, props.stopWords]);

  const handleScroll = () => {
    if (titleRef.current) {
      const rect = titleRef.current.getBoundingClientRect();
      if (!minTitle) {
        if (rect.top <= 50) dispatch({ type: ActionType.MIN_TITLE, data: true });
      }
      else {
        if (rect.top > 50) dispatch({ type: ActionType.MIN_TITLE, data: false });
      }
    }
  };

  useEffect(() => {
    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const getMostUsedWords = () => {
    if (props.msgStats) {
      let wordFreq1 = props.msgStats.getMostUsedWords(100, props.stopWords?.check.bind(props.stopWords));
      dispatch({ type: ActionType.WORD_FREQ, data: wordFreq1 });
    }
  };

  const getDailyCount = () => {
    if (props.msgStats) {
      let msgCount1 = props.msgStats.getDailyMsgCount();
      dispatch({ type: ActionType.DAILY_COUNT, data: msgCount1 });
    }
  };

  const getTotalCountStats = () => {
    if (props.msgStats) {
      let stats = props.msgStats.getTotalCountStats();
      let totMsgCount: SimpleData = {};
      let totCharCount: SimpleData = {};
      let avgCharCountPerMsg: SimpleData = {};
      Object.keys(stats).forEach(name => totMsgCount[name] = stats[name]["totMsgCount"]);
      Object.keys(stats).forEach(name => totCharCount[name] = stats[name]["totCharCount"]);
      Object.keys(stats).forEach(name => avgCharCountPerMsg[name] = stats[name]["avgCharCountPerMsg"]);
      dispatch({
        type: ActionType.TOTAL_STATS,
        data: {
          totMsgCount: totMsgCount,
          totCharCount: totCharCount,
          avgCharCountPerMsg: avgCharCountPerMsg
        }
      });
    }
  };

  const getHourlyMsg = () => {
    if (props.msgStats) {
      let stats = props.msgStats.getHourlyMsgCount();
      const formattedData: HourlyCount = {};
      Object.entries(stats).forEach(e => {
        formattedData[e[0]] = e[1].map((y, x) => [x, y]);
      });
      dispatch({ type: ActionType.HOURLY_COUNT, data: formattedData });
    }
  };

  const setDate = (date: string, mode?: string) => {
    if (props.msgStats && mode) {
      // Copy date range
      const newDateRange = dateRange.slice();
      if (mode === "start") {
        newDateRange[0] = date;
        props.msgStats.setDateRange(date);
      }
      else if (mode === "end") {
        newDateRange[1] = date;
        props.msgStats.setDateRange(undefined, date);
      }
      dispatch({ type: ActionType.DATE_RANGE, data: newDateRange });
      // Re-render report data
      getMostUsedWords();
      getDailyCount();
      getTotalCountStats();
      getHourlyMsg();
    }
  };

  const getReportTitle = () => {
    if (props.msgStats) {
      let title = props.msgStats.getReportTitle();
      if (minTitle) {
        // Only show users/group name
        // title = "A & B App Message Statistics"
        let title1 = title.split(" ");
        title = title1.slice(0, (title1.length - 3)).join(" ");
      }
      return title;
    }
  };

  const postData = async () => {
    if (props.msgStats && dailyCount && wordFreq && totalStats) {
      dispatch({ type: ActionType.SHARE_PROGRESS, data: true });
      const temp: MsgStatsObject = {
        hourlyCount: props.msgStats.getHourlyMsgCount(),
        dailyCount: dailyCount,
        mostUsedWords: wordFreq,
        totalCountStats: props.msgStats.getTotalCountStats(),
        reportTitle: props.msgStats.getReportTitle(),
        dateRange: dateRange,
      };
      const body = JSON.stringify(new MsgStatsStatic(temp));
      const id = Util.genHexString(16);
      const rawResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/test/${id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: body
      });
      const content = await rawResponse.json();
      if (content && content.insertedId) {
        dispatch({ type: ActionType.SHARE_LINK, data: `https://${window.location.host}${process.env.PUBLIC_URL}/#/?reportId=${id}` });
      }
    }
    dispatch({ type: ActionType.SHARE_PROGRESS, data: false });
  };

  return (
    <>
      {props.show &&
        <section id="report" className={styles["report-section"]}>
          <Container className={styles["report-container"]}>
            <div ref={titleRef} className={`${styles["report-title"]} ${minTitle ? styles["minimized"] : null}`}>
              {getReportTitle()}
              <div className={styles["date-range"]}>
                {!minTitle && <span>From</span>}
                {props.isStatic ? <span>{dateRange[0]}</span> : <DateInput date={dateRange[0]} setDate={(date: string) => setDate(date, "start")} />}
                {!minTitle && <span>To</span>}
                {props.isStatic ? <span>{dateRange[1]}</span> : <DateInput date={dateRange[1]} setDate={(date: string) => setDate(date, "end")} />}
              </div>
            </div>
            <hr />
            <div className={styles["msgstats-charts"]}>
              {totalStats &&
                <>
                  <ChartContainer title="Total Message Count">
                    <DonutChart data={totalStats.totMsgCount} />
                  </ChartContainer>
                  <ChartContainer title="Total Character Count">
                    <DonutChart data={totalStats.totCharCount} />
                  </ChartContainer>
                  <ChartContainer title="Average Character Count Per Message">
                    <DonutChart data={totalStats.avgCharCountPerMsg} />
                  </ChartContainer>
                </>
              }
            </div>
            <hr />
            {hourlyCount &&
              <ChartContainer title="Average Hourly Message Count">
                <LineChart data={hourlyCount} xTicks={24} xLabel={"Time of Day"} yLabel={"Number of Messages"} />
              </ChartContainer>
            }
            <hr />
            {dailyCount &&
              <ChartContainer title="Daily Message Count">
                <CalHeatMap data={dailyCount} />
              </ChartContainer>
            }
            <hr />
            {wordFreq && <WordFreqTable title="Most Used Words" wordFreq={wordFreq} />}
            {(!props.isStatic && !props.msgStats?.isSample()) &&
              <>
                <hr />
                <ChartContainer title="Share Report">
                  {!shareLink && <Button primary wide onClick={postData} disabled={shareProgress}>Create Link</Button>}
                  <Spinner displayNone={!shareProgress} />
                  {shareLink &&
                    <div className={styles["share"]}>
                      <p>Your report can now be shared with this link:</p>
                      <a href={shareLink}>{shareLink}</a>
                    </div>
                  }
                </ChartContainer>
              </>
            }
          </Container>
        </section>
      }
    </>
  );
};

const WordFreqTable = (props: { title: string, wordFreq: WordFreqList; }) => {
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
import { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";

import MsgStatsStatic from "../../feature/message-stats/MsgStatsStatic";
import MsgStats from "../../feature/message-stats/MsgStats";
import StopWords from "../../feature/message-stats/StopWords";

import Hero from "../Hero/Hero";
import Start from "../Start/Start";
import Report from "../Report/Report";

import styles from "./Main.module.scss";

type ReportData = { msgStats: MsgStats | null; stopWords: StopWords | null; };

const Main = () => {
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({ msgStats: null, stopWords: null });
  const [step, setStep] = useState<number>(1);
  const [isStatic, setIsStatic] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("reportId");
    if (id) {
      // Get from db
      fetch(`${process.env.REACT_APP_BACKEND_URL}/test/${id}`).then(
        async (r) => {
          if (r.status === 200) {
            const content = await r.json();
            const newMsgStats = new MsgStatsStatic(content);
            setReportData(prev => ({ ...prev, msgStats: newMsgStats }));
            setIsStatic(true);
            setShowReport(true);
          }
        }
      ).catch(e => {
        console.log(e);
      });
    }
    else {
      setIsStatic(false);
    }
  }, []);

  return (
    <main className={styles["main"]}>
      <Hero />
      {!isStatic && <Start step={step} setStep={setStep} setReportData={setReportData} setShowReport={setShowReport} />}
      <Report show={showReport} isStatic={isStatic} msgStats={reportData.msgStats} stopWords={reportData.stopWords} />
    </main>
  );
};

export default Main;
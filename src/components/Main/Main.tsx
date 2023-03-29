import { ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";

import MsgStatsStatic from "../../feature/message-stats/MsgStatsStatic";
import MsgStats from "../../feature/message-stats/MsgStats";
import StopWords from "../../feature/message-stats/StopWords";

import Hero from "../Hero/Hero";
import Start from "../Start/Start";
import Report from "../Report/Report";

import styles from "./Main.module.scss";
import Container from "../UI/Container/Container";

type ReportData = { msgStats: MsgStats | null; stopWords: StopWords | null; };

const Main = () => {
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({ msgStats: null, stopWords: null });
  const [step, setStep] = useState<number>(1);
  const [isStatic, setIsStatic] = useState<boolean>(false);
  const [error, setError] = useState<{show: boolean, msg: string}>({show: false, msg: ""});
  const [searchParams, setSearchParams] = useSearchParams();

  const handleError = (errorMsg: string) => {
    setError({show: true, msg: errorMsg});
    setShowReport(false);
  };

  useEffect(() => {
    const id = searchParams.get("reportId");
    if (id) {
      setIsStatic(true);
      // Get from db
      fetch(`${process.env.REACT_APP_BACKEND_URL}/test/${id}`).then(
        async (r) => {
          const status = r.status;
          if (status === 200) {
            const content = await r.json();
            const newMsgStats = new MsgStatsStatic(content);
            setReportData(prev => ({ ...prev, msgStats: newMsgStats }));
            setShowReport(true);
          }
          else {
            handleError(`Error: HTTP ${status}`)
          }
        }
      ).catch(e => {
        handleError(e.toString());
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
      {error.show && <ErrorMsg>{error.msg}</ErrorMsg>}
      <Report show={showReport} isStatic={isStatic} msgStats={reportData.msgStats} stopWords={reportData.stopWords} />
    </main>
  );
};

const ErrorMsg = (props: {children: ReactNode}) => {
  return <Container className={styles["error"]}>{props.children}</Container>
};

export default Main;
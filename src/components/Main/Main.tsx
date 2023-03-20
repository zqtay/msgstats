import { useState } from 'react';

import Hero from "../Hero/Hero";
import Start from "../Start/Start";
import Report from "../Report/Report";

import styles from "./Main.module.scss";

const Main = () => {
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState({ msgData: null, stopWords: null });
  const [step, setStep] = useState<number>(1);

  return (
    <main className={styles["main"]}>
      <Hero />
      <Start step={step} setStep={setStep} setReportData={setReportData} setShowReport={setShowReport} />
      <Report show={showReport} msgData={reportData.msgData} stopWords={reportData.stopWords} />
    </main>
  );
};

export default Main;
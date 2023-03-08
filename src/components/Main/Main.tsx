import { useState } from 'react';
import Container from "../UI/Container/Container";

import Report from "../Report/Report";
import Start from "../Start/Start";

const Main = () => {
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState({ msgData: null, stopWords: null });

  return (
    <main>
      <Start setReportData={setReportData} setShowReport={setShowReport} />
      <Report show={showReport} msgData={reportData.msgData} stopWords={reportData.stopWords} />
    </main>
  );
};

export default Main;
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import MsgData from "../MsgData";
import MsgStats from "../MsgStats";
import MsgStatsMain from "../MsgStatsMain";

const useMsgStats = (): [
  Dispatch<SetStateAction<MsgData | null>>,
  MsgStats | null,
  string,
  () => void,
] => {
  const [msgData, setMsgData] = useState<MsgData | null>(null);
  const [msgStats, setMsgStats] = useState<MsgStats | null>(null);

  const [status, setStatus] = useState<string>("");

  const clearStatus = () => {
    setStatus("");
  };

  const init = useCallback(async () => {
    if (msgData) {
      setStatus("start");
      const newMsgStats = new MsgStatsMain(msgData);
      try {
        newMsgStats.init();
      }
      catch {
        setStatus("error");
        return;
      }
      setMsgStats(newMsgStats);
      setStatus("success");
    }
  }, [msgData]);

  useEffect(() => {
    init();
  }, [init]);

  return [setMsgData, msgStats, status, clearStatus];
};

export default useMsgStats;
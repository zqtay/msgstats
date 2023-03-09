import { Dispatch, SetStateAction, useEffect, useState } from "react";
import MsgData from "../MsgData";
import Parser from "../Parser";

const useMsgData = (): [
  Dispatch<SetStateAction<string>>,
  Dispatch<SetStateAction<FileList | null>>,
  MsgData | null,
  string
] => {
  const [msgApp, setMsgApp] = useState<string>("");
  const [msgFileList, setMsgFileList] = useState<FileList | null>(null);
  const [msgData, setMsgData] = useState<MsgData | null>(null);
  const [status, setStatus] = useState<string>("");

  const init = async () => {
    let msgDataText: string;

    if (msgApp === null || msgApp === "") {
      setMsgData(prevState => null);
      setStatus(prevState => "app_not_selected");
      return;
    }

    if (msgFileList === null || msgFileList.length === 0) {
      setMsgData(prevState => null);
      setStatus(prevState => "no_file");
      return;
    }

    setStatus(prevState => "parse_start");

    try {
      if (msgApp === "telegram") {
        msgDataText = await Parser.parseTelegramMsg(msgFileList, setStatus);
      }
      else {
        setMsgData(prevState => null);
        setStatus(prevState => "app_unknown");
        return;
      }
    }
    catch (e) {
      setStatus(prevState => "parse_failed");
      return;
    }

    setStatus(prevState => "init_start");

    const newMsgData: MsgData = new MsgData();
    try {
      await newMsgData.init(msgDataText);
    }
    catch (e) {
      setStatus(prevState => "init_failed");
      return;
    }

    setMsgData(prevState => newMsgData);

    setStatus(prevState => "success");
  };

  useEffect(() => {
    init();
  }, [msgApp, msgFileList]);

  return [setMsgApp, setMsgFileList, msgData, status];
};

export default useMsgData;
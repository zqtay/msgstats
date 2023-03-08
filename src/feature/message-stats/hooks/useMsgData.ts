import { Dispatch, SetStateAction, useEffect, useState } from "react";
import MsgData from "../MsgData";
import Parser from "../Parser";

export default function useMsgData(): [Dispatch<SetStateAction<FileList | null>>, MsgData | null, Dispatch<SetStateAction<MsgData | null>>, string] {
  const [msgFileList, setMsgFileList] = useState<FileList | null>(null);
  const [msgData, setMsgData] = useState<MsgData | null>(null);
  const [status, setStatus] = useState<string>("");

  const init = async () => {
    let msgDataText: string;

    if (msgFileList === null || msgFileList.length === 0) {
      setMsgData(prevState => null);
      setStatus(prevState => "no_file");
      return;
    }

    setStatus(prevState => "parse_start");

    try {
      msgDataText = await Parser.parseMsg(msgFileList, setStatus);
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
  }, [msgFileList]);

  return [setMsgFileList, msgData, setMsgData, status];
}
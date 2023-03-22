import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import MsgData from "../MsgData";
import Parser, { ParseStatus } from "../Parser";
import SampleData from "../SampleData";

export type MsgFilesInput = {
  app: string;
  fileList: FileList | null;
  useSample: boolean;
};

const statusDefault = { state: "", error: "" };

const useMsgData = (): [
  Dispatch<SetStateAction<MsgFilesInput>>,
  MsgData | null,
  ParseStatus,
  () => void,
] => {
  const [msgFilesInput, setMsgFilesInput] = useState<MsgFilesInput>({ app: "", fileList: null, useSample: false });
  const [msgData, setMsgData] = useState<MsgData | null>(null);
  const [status, setStatus] = useState<ParseStatus>(statusDefault);

  const setParseState = (state: string) => setStatus(prev => ({ ...prev, state: state }));
  const setParseError = (error: string) => setStatus(prev => ({ ...prev, error: error }));

  const clearStatus = () => {
    setStatus(statusDefault);
  };

  const init = useCallback(async () => {
    let msgDataText: string;
    setParseError("");
    setParseState("");

    if (msgFilesInput.app === "") {
      setMsgData(null);
      setParseError("app_not_selected");
      return;
    }

    setParseState("parse_start");

    try {
      if (msgFilesInput.app === "telegram") {
        if (msgFilesInput.useSample) {
          msgDataText = SampleData.generate(msgFilesInput.app);
        }
        else if (msgFilesInput.fileList) {
          msgDataText = await Parser.parseTelegramMsg(msgFilesInput.fileList, setParseState);
        }
        else {
          setMsgData(null);
          setParseError("no_file");
          return;
        }
      }
      else {
        setMsgData(null);
        setParseError("app_unknown");
        return;
      }
    }
    catch (e) {
      setParseError("parse_failed");
      return;
    }

    setParseState("init_start");

    const newMsgData: MsgData = new MsgData();
    try {
      await newMsgData.init(msgDataText);
    }
    catch (e) {
      setParseError("init_failed");
      return;
    }

    setMsgData(newMsgData);

    setParseState("success");
  }, [msgFilesInput]);

  useEffect(() => {
    init();
  }, [init]);

  return [setMsgFilesInput, msgData, status, clearStatus];
};

export default useMsgData;
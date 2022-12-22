import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Parser from "../../../core/msg-analyzer/Parser";
import StopWords from "../../../core/msg-analyzer/StopWords";

export default function useStopWords(swFileList: FileList | null): [StopWords | null, Dispatch<SetStateAction<StopWords | null>>, string] {
  const [stopWords, setStopWords] = useState<StopWords | null>(null);
  const [status, setStatus] = useState<string>("");

  const init = async () => {
    let stopWordsText: string;

    if (swFileList === null || swFileList.length === 0) {
      setStopWords(prevState => null);
      setStatus(prevState => "no_file");
      return;
    }

    setStatus(prevState => "parse_start");

    try {
      stopWordsText = await Parser.parseStopWords(swFileList, setStatus);
    }
    catch (e) {
      setStatus(prevState => "parse_failed");
      return;
    }

    setStatus(prevState => "init_start");

    const newStopWords: StopWords = new StopWords();
    try {
      await newStopWords.init(stopWordsText);
    }
    catch (e) {
      setStatus(prevState => "init_failed");
      return;
    }

    setStopWords(prevState => newStopWords);

    setStatus(prevState => "success");
  };

  useEffect(() => {
    init();
  }, [swFileList]);

  return [stopWords, setStopWords, status];
}
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import Parser from "../Parser";
import StopWords from "../StopWords";

const useStopWords = (): [
  Dispatch<SetStateAction<FileList | null>>,
  StopWords | null,
  string
] => {
  const [swFileList, setSwFileList] = useState<FileList | null>(null);
  const [stopWords, setStopWords] = useState<StopWords | null>(null);
  const [status, setStatus] = useState<string>("");

  const init = useCallback(async () => {
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
  }, [swFileList]);

  useEffect(() => {
    init();
  }, [init]);

  return [setSwFileList, stopWords, status];
};

export default useStopWords;
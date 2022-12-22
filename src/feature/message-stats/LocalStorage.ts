import { plainToClass } from 'class-transformer';
import MsgData from "./MsgData";
import StopWords from "./StopWords";

export const MSGDATA_STORAGE_KEY: string = "MsgAnalyzerService.msgData";
export const STOPWORDS_STORAGE_KEY: string = "MsgAnalyzerService.stopWords";

export type MAObject = {
  msgData: MsgData,
  stopWords: StopWords;
};

export async function saveMA(msgData: MsgData, stopWords: StopWords): Promise<void> {
  try {
    sessionStorage.setItem(MSGDATA_STORAGE_KEY, JSON.stringify(msgData));
    sessionStorage.setItem(STOPWORDS_STORAGE_KEY, JSON.stringify(stopWords));
  }
  catch (e) {
    if (e instanceof DOMException &&
      (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      console.log(e);
      sessionStorage.clear();
    }
  }
}

export async function loadMA(): Promise<[MsgData | null, StopWords | null]> {
  const loadedMsgData = sessionStorage.getItem(MSGDATA_STORAGE_KEY);
  const loadedStopWords = sessionStorage.getItem(STOPWORDS_STORAGE_KEY);

  const msgData = (loadedMsgData === null) ? null : plainToClass(MsgData, JSON.parse(loadedMsgData));
  const stopWords = (loadedStopWords === null) ? null : plainToClass(StopWords, JSON.parse(loadedStopWords));

  return [msgData, stopWords];
}
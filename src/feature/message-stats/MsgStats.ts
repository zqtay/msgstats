// {user: {date: count}}
export type DailyCount = { [key: string]: { [key: string]: number; }; };
// {user: count[24]}
export type HourlyCount = { [key: string]: number[]; };
// {user: {date: count[24]}}
export type HourlyCountByDate = { [key: string]: { [key: string]: number[]; }; };
// {user: {word: count}}
export type WordFrequency = { [key: string]: { [key: string]: number; }; };
// {user: {word: count}[]}
export type WordFreqList = { [key: string]: { [key: string]: number; }[]; };
// {user: {stats}}
export type TotalCountStats = {
  [key: string]: {
    totMsgCount: number;
    avgMsgCountPerDay: number;
    medMsgCountPerDay: number;
    stdMsgCountPerDay: number;
    totCharCount: number;
    avgCharCountPerMsg: number;
    medCharCountPerMsg: number;
    stdCharCountPerMsg: number;
  };
};

abstract class MsgStats {
  // (24 * 60 * 60 * 1000) = 86400000
  public static MILLISECONDS_PER_DAY: number = 86400000;
  public static HOURS_PER_DAY: number = 24;

  constructor() {

  }

  public abstract init(): void;

  public abstract setDateRange(dateStart?: string, dateEnd?: string): void;

  public abstract getDateRange(): string[];

  public abstract getDailyMsgCount(): DailyCount;

  public abstract getHourlyMsgCount(): HourlyCount;

  public abstract getWordFrequency(filter?: Function): WordFrequency;

  public abstract getMostUsedWords(limit?: number, filter?: Function): WordFreqList;

  public abstract getTotalCountStats(): TotalCountStats;

  public abstract getReportTitle(): string;
}

export default MsgStats;
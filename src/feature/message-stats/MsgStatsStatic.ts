import MsgStats, { DailyCount, HourlyCount, TotalCountStats, WordFreqList, WordFrequency } from "./MsgStats";

export type MsgStatsObject = {
  hourlyCount: HourlyCount;
  dailyCount: DailyCount;
  mostUsedWords: WordFreqList;
  totalCountStats: TotalCountStats;
  reportTitle: string;
  dateRange: string[];
};

class MsgStatsStatic extends MsgStats {
  private dailyCount: DailyCount;
  private hourlyCount: HourlyCount;
  private mostUsedWords: WordFreqList;
  private totalCountStats: TotalCountStats;
  private reportTitle: string;
  private dateRange: string[];

  constructor(obj: MsgStatsObject) {
    super();
    this.dailyCount = obj.dailyCount;
    this.hourlyCount = obj.hourlyCount;
    this.mostUsedWords = obj.mostUsedWords;
    this.totalCountStats = obj.totalCountStats;
    this.reportTitle = obj.reportTitle;
    this.dateRange = obj.dateRange;
  }

  public init(): void {

  }

  public setDateRange(dateStart?: string, dateEnd?: string): void {
    throw new Error('Method not supported');
  }

  public getDateRange(): string[] {
    return this.dateRange;
  }

  public getDailyMsgCount(): DailyCount {
    return this.dailyCount;
  }

  public getHourlyMsgCount(): HourlyCount{
    return this.hourlyCount;
  }

  public getWordFrequency(filter: Function = ((word: string) => true)): WordFrequency {
    throw new Error('Method not supported');
  }

  public getMostUsedWords(limit: number = 100, filter: Function = ((word: string) => true)): WordFreqList {
    return this.mostUsedWords;
  }

  public getTotalCountStats(): TotalCountStats {
    return this.totalCountStats;
  }

  public getReportTitle(): string {
    return this.reportTitle;
  }

  public isSample(): boolean {
    return false;
  }
}

export default MsgStatsStatic;
class MsgEntry {
  private date: string;
  private time: string;
  private sender: string;
  private text: string;

  public constructor() {
    this.date = "";
    this.time = "";
    this.sender = "";
    this.text = "";
  }

  public init(entryLine: string): void {
    // Get first delimiter index
    let delimiterIndex = entryLine.indexOf(",");
    // Slice entryLine until delimiter
    [this.date, this.time] = this.processDateTime(entryLine.slice(0, delimiterIndex));
    // Next delimiter
    entryLine = entryLine.slice(delimiterIndex + 1);
    delimiterIndex = entryLine.indexOf(",");
    this.sender = entryLine.slice(0, delimiterIndex);
    // Remaining string is message text
    this.text = entryLine.slice(delimiterIndex + 1);
  }

  public getDate(): string {
    return this.date;
  }

  public getDateObject(): Date {
    return new Date(this.date);
  }

  public getTime(): string {
    return this.time;
  }

  public getHour(): number {
    return parseInt(this.time.slice(0, 2));
  }

  public getDateTime(): string {
    // "2018-07-29T08:47:05.000Z"
    return `${this.date}T${this.time}.000Z`;
  }

  public getSender(): string {
    return this.sender;
  }

  public getText(): string {
    return this.text;
  }

  private processDateTime(s: string): string[] {
    // s = "29.07.2018 08:47:05 UTC+08:00"
    let sList = s.split(" ");
    let date = sList[0].split(".");
    return [`${date[2]}-${date[1]}-${date[0]}`, sList[1]];
  }
}

export default MsgEntry;
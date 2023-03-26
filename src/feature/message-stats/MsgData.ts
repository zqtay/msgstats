import MsgEntry from "./MsgEntry";

class MsgData {
  private appName: string;
  private msgTarget: string;
  private entryList: MsgEntry[];
  private userList: string[];
  private dateList: string[];

  constructor() {
    this.appName = "";
    this.msgTarget = "";
    this.entryList = [];
    this.userList = [];
    this.dateList = [];
  }

  public init(data: string): void {
    try {
      this.initData(data);
      this.userList = this.initUserList();
      this.dateList = this.initDateList();
    }
    catch (e) {
      console.error(e);
      this.clear();
      throw e;
    }
  }

  private initData(data: string): void {
    let lines = data.split("\n");
    this.appName = lines[0].split("app=")[1];
    this.msgTarget = lines[1].split("msgTarget=")[1];
    lines = lines.slice(2);
    this.entryList = lines.map((e: string, i: number) => {
      let entry = new MsgEntry();
      entry.init(e);
      return entry;
    });
  }

  private initUserList(): string[] {
    return Array.from(new Set(this.entryList.map(e => e.getSender())));
  }

  private initDateList(): string[] {
    let res: string[] = [];
    let date: string = "";
    for (let i = 0; i < this.entryList.length; i++) {
      date = this.entryList[i].getDate();
      if (i === 0) {
        res.push(date);
      }
      else {
        if (date !== res[res.length - 1] && !res.includes(date)) {
          res.push(date);
        }
      }
    }
    // It should be already sorted, but sort again just in case
    res.sort();
    return res;
  }

  public getAppName(): string {
    let appName: string = "";
    switch (this.appName) {
      case "telegram":
        appName = "Telegram";
        break;
      case "sample":
        appName = "Sample";
        break;
    }
    return appName;
  }

  public getMsgTarget(): string {
    return this.msgTarget;
  }

  public getEntryList(): MsgEntry[] {
    return this.entryList;
  }

  public getUserList(): string[] {
    return this.userList;
  }

  public getDateList(): string[] {
    return this.dateList;
  }

  public clear(): void {
    this.entryList = [];
    this.userList = [];
    this.dateList = [];
  }
}

export default MsgData;
import MsgEntry from "./MsgEntry";
import MsgStats from "./MsgStats";

class MsgData {
  private entryList: MsgEntry[];

  private userList: string[];
  private dateList: string[];
  public stats: MsgStats;

  constructor() {
    this.entryList = [];
    this.userList = [];
    this.dateList = [];
    this.stats = new MsgStats();
  }

  public async init(csvText: string): Promise<void> {
    try {
      this.entryList = this.initEntryList(csvText);
      this.userList = this.initUserList();
      this.dateList = this.initDateList();
      this.stats.init(this);
    }
    catch (e) {
      console.error(e);
      this.clear();
      throw e;
    }
  }

  private initEntryList(csvText: string): MsgEntry[] {
    return csvText.split("\n").map((e: string) => {
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
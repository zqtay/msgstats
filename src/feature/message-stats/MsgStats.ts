import MsgData from "./MsgData";
import MsgEntry from "./MsgEntry";
import Util from "./Util";

type WordFrequency = { [key: string]: { [key: string]: number; }; };
type HourlyMsgCountByDate = { [key: string]: { [key: string]: number[]; }; };

class MsgStats {
  // (24 * 60 * 60 * 1000) = 86400000
  public static MILLISECONDS_PER_DAY: number = 86400000;
  public static HOURS_PER_DAY: number = 24;

  private msgCount: HourlyMsgCountByDate;
  private msgData: MsgData;
  private entryList: MsgEntry[];
  private dateStart: Date;
  private dateEnd: Date;

  constructor(msgData: MsgData) {
    this.msgCount = {};
    this.msgData = msgData;
    this.entryList = [];
    this.dateStart = new Date();
    this.dateEnd = new Date();
  }

  public init() {
    let res: any = {};

    // temp vars
    let listByUser: MsgEntry[] = [];
    let listByDate: MsgEntry[] = [];

    for (const user of this.msgData.getUserList()) {
      // Init empty object
      res[user] = {};
      // Get temp list by user
      listByUser = this.msgData.getEntryList().filter(e => (e.getSender() === user));

      for (const date of this.msgData.getDateList()) {
        // Init empty list
        (res[user][date] = []).length = MsgStats.HOURS_PER_DAY;
        res[user][date].fill(0);

        // Get temp list by date
        listByDate = listByUser.filter(e => (e.getDate() === date));
        for (const entry of listByDate) {
          res[user][date][entry.getHour()] += 1;
        }
      }
    }
    this.msgCount = res;
    this.entryList = this.msgData.getEntryList();
    const dateList: string[] = this.msgData.getDateList();
    this.dateStart = new Date(dateList[0]);
    this.dateEnd = new Date(dateList[dateList.length - 1]);
  }

  public setDateRange(dateStart?: string, dateEnd?: string) {
    if (dateStart) this.dateStart = new Date(dateStart);
    if (dateEnd) this.dateEnd = new Date(dateEnd);
    this.entryList = this.msgData.getEntryList().filter(entry => {
      const entryDate = entry.getDateObject();
      return (entryDate >= this.dateStart && entryDate <= this.dateEnd);
    });
  }

  public getDailyMsgCount() {
    let dailyCount: { [key: string]: { [key: string]: number; }; } = {};
    this.msgData.getUserList().forEach(user => dailyCount[user] = {});
    let loop = this.dateStart;
    while (loop <= this.dateEnd) {
      const dateString = loop.toISOString().split("T")[0];
      for (const user of this.msgData.getUserList()) {
        const hourlyCount = this.msgCount[user][dateString];
        const count = hourlyCount === undefined ? 0 : Object.values(hourlyCount).reduce((a, b) => a + b);
        dailyCount[user][dateString] = count;
      }
      loop = new Date(loop.valueOf() + MsgStats.MILLISECONDS_PER_DAY);
    }
    return dailyCount;
  }

  public getHourlyMsgCount() {
    let res: { [key: string]: number[]; } = {};
    this.msgData.getUserList().forEach(user => {
      (res[user] = []).length = MsgStats.HOURS_PER_DAY;
      res[user].fill(0);
    });
    let loop = this.dateStart;
    while (loop <= this.dateEnd) {
      const dateString = loop.toISOString().split("T")[0];
      for (const user of this.msgData.getUserList()) {
        const hourlyCount = this.msgCount[user][dateString];
        if (hourlyCount) {
          for (let hr = 0; hr < MsgStats.HOURS_PER_DAY; hr++) {
            res[user][hr] += hourlyCount[hr];
          }
        }
      }
      loop = new Date(loop.valueOf() + MsgStats.MILLISECONDS_PER_DAY);
    }
    // Calculate daily average
    const days = ((this.dateEnd.valueOf() - this.dateStart.valueOf()) / MsgStats.MILLISECONDS_PER_DAY) + 1
    this.msgData.getUserList().forEach(user => {
      res[user] = res[user].map(count => count/days);
    });
    return res;
  }


  public getWordFrequency(filter: Function = ((word: string) => true)): WordFrequency {
    let res: any = {};
    let wordList: string[] = [];

    // Init empty object
    this.msgData.getUserList().forEach(user => {
      res[user] = {};
    });

    for (const entry of this.entryList) {
      let user: string = entry.getSender();
      wordList = MsgStats.tokenizeText(entry.getText());

      // console.log(entry.getDateTime());

      for (const word of wordList) {
        // Skip excluded word
        if (!filter(word)) continue;
        // Add count
        if (res[user][word] === undefined) {
          res[user][word] = 1;
        }
        else {
          res[user][word] += 1;
        }
      }
    }
    return res;
  }

  public getMostUsedWords(limit: number = 100, filter: Function = ((word: string) => true)) {
    // {user1: [{word1: freq1}, {word2: freq2}, ...], ...}
    let res: { [key: string]: { [key: string]: number; }[]; } = {};
    let wordFreq = this.getWordFrequency(filter);

    for (const user of this.msgData.getUserList()) {
      const sortedWords = Util.sortObjectKeys(wordFreq[user], true, limit);
      res[user] = sortedWords.map(word => ({ [word]: wordFreq[user][word] }));
    }

    return res;
  }

  public getMsgStats() {
    let res: any = {};

    // number of days, inclusive
    const numOfDays = ((this.dateEnd.valueOf() - this.dateStart.valueOf()) / MsgStats.MILLISECONDS_PER_DAY) + 1;
    const dailyCount = this.getDailyMsgCount();

    for (const user of this.msgData.getUserList()) {
      // Get msg entries from this user
      const entryList: MsgEntry[] = this.entryList.filter(e => (e.getSender() === user));
      // Get msg count of each day and add to a list
      let msgCountList: number[] = Object.values(dailyCount[user]);
      let charCountList: number[] = entryList.map(e => e.getText().length);

      res[user] = {};
      res[user]["totMsgCount"] = entryList.length;
      res[user]["avgMsgCountPerDay"] = res[user]["totMsgCount"] / numOfDays;
      res[user]["medMsgCountPerDay"] = Util.getMedian(msgCountList);
      res[user]["stdMsgCountPerDay"] = Util.getStandardDeviation(msgCountList);

      let charCount = 0;
      entryList.forEach(e => charCount += e.getText().length);
      res[user]["totCharCount"] = charCount;
      res[user]["avgCharCountPerMsg"] = charCount / res[user]["totMsgCount"];
      res[user]["medCharCountPerMsg"] = Util.getMedian(charCountList);
      res[user]["stdCharCountPerMsg"] = Util.getStandardDeviation(charCountList);
    }
    return res;
  }

  private static tokenizeText(text: string, includeEmoji: boolean = true): string[] {
    // Convert text to lower case and split text to words by spaces
    let tokens = text.toLowerCase().split(/\s+/);

    tokens = tokens.filter(e => {
      // Filter out all URLs
      if (e.startsWith("http://") || e.startsWith("https://") || e.startsWith("www.")) {
        return false;
      }
      // Filter out all words that do not contain alphabets
      else if (e.match(/[a-z]/) === null) {
        return false;
      }
      return true;
    });

    // Remove leading and trailing symbols/punctuations
    tokens = tokens.map(e => {
      let s = e.split(/\W+/);
      if (s.length === 2) {
        // Leading symbols
        if (s[0] === "" && s[1] !== "") {
          return s[1];
        }
        // Trailing symbols
        else if (s[0] !== "" && s[1] === "") {
          return s[0];
        }
      }
      else if (s.length === 3) {
        // Both
        if (s[0] === "" && s[1] !== "" && s[2] === "") {
          return s[1];
        }
      }
      return e;
    });

    // Add back emoji
    // https://stackoverflow.com/questions/43242440/javascript-regular-expression-for-unicode-emoji/45138005
    // https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AExtended_Pictographic%3A%5D
    if (includeEmoji) {
      let emojis = text.match(/\p{Extended_Pictographic}/ug);
      if (emojis !== null && emojis.length !== 0) {
        tokens = tokens.concat(emojis);
      }
    }

    return tokens;
  }
}

export default MsgStats;
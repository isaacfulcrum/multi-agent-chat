import { BehaviorSubject } from "rxjs";

import { Log, LogType } from "./type";

// ********************************************************************************
class LogService {
  private logs$ = new BehaviorSubject<Log[]>([]);
  public onLog$ = () => this.logs$;

  // === Singleton ================================================================
  private static instance: LogService;
  public static getInstance(): LogService {
    if (!LogService.instance) LogService.instance = new LogService();
    return LogService.instance;
  }
  constructor() {
    /*nothing yet*/
  }

  // === Logs =====================================================================
  /** adds an info log to the list
   * @param message The message to log. Accepts markdown. */
  public infoLog(message: string, sender?: string) {
    this.addLog({ type: LogType.info, message, sender });
  }

  /** adds an error log to the list
   * @param message The message to log. Accepts markdown. */
  public errorLog(message: string, sender?: string) {
    this.addLog({ type: LogType.error, message, sender });
  }

  private addLog(log: Log) {
    this.logs$.next([...this.logs$.getValue(), log]);
  }
}

export const logServiceInstance = LogService.getInstance();

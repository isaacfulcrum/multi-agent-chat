import { BehaviorSubject } from "rxjs";

import { Log, LogType } from "./type";

// ********************************************************************************
export class LogControllerService {
  private logs$ = new BehaviorSubject<Log[]>([]);
  public onLog$ = () => this.logs$;

  // === Singleton ================================================================
  private static instance: LogControllerService;
  public static getInstance(): LogControllerService {
    if (!LogControllerService.instance) LogControllerService.instance = new LogControllerService();
    return LogControllerService.instance;
  }
  protected constructor() { /*nothing yet*/ }

  // === Logs =====================================================================
  public addLog(log: Log) {
    this.logs$.next([...this.logs$.getValue(), log]);
  }
}

// ********************************************************************************
export class LoggerService {
  // === Lifecycle =================================================================
  constructor(private readonly name: string) {
    /*nothing yet*/
  }

  // === Logs =====================================================================
  /** adds an info log to the list
   * @param message The message to log. Accepts markdown. */
  public log(message: string) {
    LogControllerService.getInstance().addLog({ type: LogType.info, message, sender: this.name });
  }

  /** adds an error log to the list
   * @param message The message to log. Accepts markdown. */
  public error(message: string) {
    LogControllerService.getInstance().addLog({ type: LogType.error, message, sender: this.name });
  }
}

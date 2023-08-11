import { BehaviorSubject, map } from "rxjs";

import { Log, LogIdentifier, LogSender, LogType } from "./type";
import { nanoid } from "nanoid";
import { normalizeString } from "@/util/string";

// ********************************************************************************
export class LogControllerService {
  private logs$ = new BehaviorSubject<Log[]>([]);
  public onLog$ = (senderFilter: string) => {
    if (!senderFilter) return this.logs$.asObservable();
    return this.logs$.asObservable().pipe(map((logs) => logs.filter((log) => normalizeString(log.sender) === senderFilter)));
  };

  /** sender of all available logs
   * K: sender name id (internal)
   * V: sender name (display)*/
  private logSender$ = new BehaviorSubject<LogSender[]>([]);
  public onLogSender$ = () => this.logSender$;

  // === Singleton ================================================================
  private static instance: LogControllerService;
  public static getInstance(): LogControllerService {
    if (!LogControllerService.instance) LogControllerService.instance = new LogControllerService();
    return LogControllerService.instance;
  }
  protected constructor() {
    /*nothing yet*/
  }

  // === Logs =====================================================================
  public addLog(log: Omit<Log, "id">) {
    const id: LogIdentifier = nanoid();
    const newLog: Log = { ...log, id };
    this.logs$.next([...this.logs$.getValue(), newLog]);

    // add the sender to the list of senders
    const senderMap = this.logSender$.getValue();
    const senderKey = normalizeString(log.sender);
    // if the sender is not in the list, add it
    if (!senderMap.find((sender) => normalizeString(sender.name) === senderKey)) {
      senderMap.push({ id: senderKey, name: log.sender });
    }
    this.logSender$.next(senderMap);
  }
}

// ********************************************************************************
export class LoggerService {
  // === Lifecycle =================================================================
  constructor(private readonly name: string) {}

  // === Logs =====================================================================
  /** adds an info log to the list
   * @param message The message to log. Accepts markdown. */
  public log(message: string, color = "#333333" /*default*/) {
    LogControllerService.getInstance().addLog({ type: LogType.info, message, sender: this.name, color });
  }

  /** adds an error log to the list
   * @param error The error to log. Can be any type (usually an Error) */
  public error(error: any, color = "#333333" /*default*/) {
    if (error instanceof Error) {
      LogControllerService.getInstance().addLog({ type: LogType.error, message: error.message, sender: this.name, color });
    } else console.error(error); /*log the error to the console*/
  }
}

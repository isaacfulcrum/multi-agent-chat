// ********************************************************************************
export enum LogType {
  info = "info",
  error = "error",
}

export type Log = {
  type: LogType;
  message: string;
  sender: string;
  color: string;
};

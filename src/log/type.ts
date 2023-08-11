// ********************************************************************************
export enum LogType {
  info = "info",
  error = "error",
}

export type LogIdentifier = string /*alias*/;
export type Log = {
  type: LogType;
  id: LogIdentifier;
  message: string;
  sender: string;
  color: string;
};

// NOTE: Only used for the sender list, that's why it's not on the Log type
export type LogSender = {
  id: string;
  name: string;
};

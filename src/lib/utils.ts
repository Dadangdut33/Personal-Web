import { FormErrors } from "@mantine/form";
import moment from "moment";

import { TypedFormData, TypedFormDataValue } from "./types";

export function getTimeMs(amount: number, type: "second" | "minute" | "hour" | "day" | "week") {
  // Utilitas untuk mengubah waktu dalam satuan tertentu menjadi milidetik
  if (type == "second") return amount * 1000;
  if (type == "minute") return amount * 60 * 1000;
  if (type == "hour") return amount * 60 * 60 * 1000;
  if (type == "day") return amount * 24 * 60 * 60 * 1000;
  if (type == "week") return amount * 7 * 24 * 60 * 60 * 1000;
}

export function limitString(str: string, limit: number): string {
  return str.length > limit ? str.substring(0, limit - 3) + "..." : str;
}

export function formatDate(date: Date | string): string {
  return moment(date).format("DD/MM/YYYY");
}

export function formatDateDetailed(date: Date | string): string {
  return moment(date).format("DD/MM/YYYY HH:mm:ss");
}

export function getLocalDate() {
  const date = new Date();
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - userTimezoneOffset);
}

export function calculateDaysBetweenDates(start: Date, end: Date): number {
  return moment(end).diff(moment(start), "days") + 1;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return moment(date1).isSame(date2, "day");
}

export function mapFormErrorsToMessage(errors: FormErrors): string {
  return Object.values(errors).join(", ");
}

export function formErrorToString(error: FormErrors) {
  const keys = Object.keys(error);
  let errorStr = "";
  keys.forEach((key, i) => {
    errorStr += `- ${error[key]}${i === keys.length - 1 ? "" : "\n"}`;
  });
  return errorStr;
}

export function readableFileSize(attachmentSize: number) {
  const DEFAULT_SIZE = 0;
  const fileSize = attachmentSize ?? DEFAULT_SIZE;

  if (!fileSize) {
    return `${DEFAULT_SIZE} kb`;
  }

  const sizeInKb = fileSize / 1024;

  if (sizeInKb > 1024) {
    return `${(sizeInKb / 1024).toFixed(2)} mb`;
  } else {
    return `${sizeInKb.toFixed(2)} kb`;
  }
}

export function getFileName(fName: string) {
  return fName.replace(/^(.*[/\\])?/, "").replace(/(\.[^.]*)$/, "");
}

export function getExtension(fName: string) {
  let basename = fName.split(/[\\/]/).pop(); // extract file name from full path ...
  if (!basename) return null;

  // (supports `\\` and `/` separators)
  let pos = basename.lastIndexOf("."); // get last position of `.`
  if (pos < 1)
    // if file name is empty or ...
    return null; //  `.` not found (-1) or comes first (0)

  return basename.slice(pos + 1); // extract extension ignoring `.`
}

export function getTypedFormData<T extends Record<string, TypedFormDataValue>>(
  form?: HTMLFormElement | null
): TypedFormData<T> {
  return new FormData(form || undefined) as unknown as TypedFormData<T>;
}

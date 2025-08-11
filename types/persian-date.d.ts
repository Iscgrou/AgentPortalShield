declare module 'persian-date' {
  class PersianDate {
    constructor(date?: Date | string | number);
    format(format: string): string;
    unix(): number;
    toDate(): Date;
    add(amount: number, unit: string): PersianDate;
    subtract(amount: number, unit: string): PersianDate;
  }
  export = PersianDate;
}
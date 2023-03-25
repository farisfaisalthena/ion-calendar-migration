import { ICalendarOriginal } from './calendar';
import { ICalendarDay } from "./calendar.day";

export interface ICalendarMonth {
  original: ICalendarOriginal;
  days: Array<ICalendarDay | void>;
}

// interface ICalendarMonthOriginal {
//   time: number;
//   date: Date;
//   year: number;
//   month: number;
//   firstWeek: number;
//   howManyDays: number;
// }

// interface ICalendarMonthDays {
//   time: number;
//   isToday: boolean;
//   selected: boolean;
//   disable: boolean;
//   cssClass: string;
//   isLastMonth?: boolean;
//   isNextMonth?: boolean;
//   title?: string;
//   subTitle?: string;
//   marked?: boolean;
//   style?: ICalendarMonthDayStyle;
//   isFirst?: boolean;
//   isLast?: boolean;
// }

interface ICalendarMonthDayStyle {
  title?: string;
  subTitle?: string;
}

// export interface ICalendarOriginal {
//   time: number;
//   date: Date;
//   year: number;
//   month: number;
//   firstWeek: number;
//   howManyDays: number;
// }

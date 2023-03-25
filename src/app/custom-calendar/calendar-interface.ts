import { PickerMode } from './types';

export interface ICalendarMonthChangeEv {
  oldMonth: string;
  newMonth: string;
}

export interface ICalendarOriginal {
  timestamp: number;
  date: Date;
  year: number;
  month: number;
  firstWeek: number;
  daysInMonth: number;
}

export interface ICalendarDay {
  timestamp: number;
  today: boolean;
  selected: boolean;
  disabled: boolean;
  cssClass: string;
  isLastMonth?: boolean;
  isNextMonth?: boolean;
  title?: string;
  marked?: boolean;
}

export interface ICalendarMonth {
  original: ICalendarOriginal;
  days: Array<ICalendarDay | void>;
}

export interface ICalendarOptions {
  /** Start Date */
  from?: Date | number;
  /** End Date */
  to?: Date | number;
  /** Calendar mode. Default to single */
  pickerMode?: PickerMode;
  /** Set week start date */
  weekStart?: number;
  /** Weeks to be disabled (0-6) */
  disableWeeks?: number[];
  /** Month Format. Default to MMM YYYY */
  monthFormat?: string;
  /** Days configuration array */
  daysConfig: IDayConfig[];
  /** Determine if other months overlaps with current month. Default to true */
  overlapMonths?: boolean;
  showToggleButtons?: boolean;
  showMonthPicker?: boolean;
}

export interface IDayConfig {
  date: Date;
  marked?: boolean;
  disable?: boolean;
  title?: string;
  cssClass?: string;
}

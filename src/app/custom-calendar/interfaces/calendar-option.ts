export type DefaultDate = Date | string | number | null;

type PickerMode = 'single' | 'multi' | 'range';

export interface ICalendarOptionsV2 {
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

export interface ICalendarModalOptions extends ICalendarOptions {
  autoDone?: boolean;
  format?: string;
  cssClass?: string;
  id?: string;
  isSaveHistory?: boolean;
  closeLabel?: string;
  doneLabel?: string;
  clearLabel?: string;
  closeIcon?: boolean;
  doneIcon?: boolean;
  canBackwardsSelected?: boolean;
  title?: string;
  defaultScrollTo?: Date;
  defaultDate?: DefaultDate;
  defaultDates?: DefaultDate[];
  defaultDateRange?: { from: DefaultDate; to?: DefaultDate } | null;
  step?: number;
  /**
   * @deprecated this version notwork
   */
  showYearPicker?: boolean;
  defaultEndDateToStartDate?: boolean;
}

export interface ICalendarOptions {
  from?: Date | number;
  to?: Date | number;
  pickMode: "multi" | "single" | "range";
  weekStart?: number;
  disableWeeks?: Array<number>;
  weekdays?: Array<string>;
  monthFormat?: string;
  color?: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  daysConfig?: Array<DayConfig>;
  /**
   * show last month & next month days fill six weeks
   */
  showAdjacentMonthDay?: boolean;
}

export interface DayConfig {
  date: Date;
  marked?: boolean;
  disable?: boolean;
  title?: string;
  subTitle?: string;
  cssClass?: string;
}

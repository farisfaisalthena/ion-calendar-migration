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

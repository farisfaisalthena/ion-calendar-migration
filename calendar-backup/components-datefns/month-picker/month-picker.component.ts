import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export class CalendarMonth {
  original!: CalendarOriginal;
  days!: Array<CalendarDay | void>;
}

export interface CalendarOriginal {
  time: number;
  date: Date;
  year: number;
  month: number;
  firstWeek: number;
  howManyDays: number;
}

export interface CalendarDay {
  time: number;
  isToday: boolean;
  selected: boolean;
  disable: boolean;
  cssClass: string;
  isLastMonth?: boolean;
  isNextMonth?: boolean;
  title?: string;
  subTitle?: string;
  marked?: boolean;
  style?: {
    title?: string;
    subTitle?: string;
  };
  isFirst?: boolean;
  isLast?: boolean;
}

@Component({
  selector: 'ion-month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.scss'],
})
export class MonthPickerComponent  implements OnInit {

  _thisMonth = new Date();
  _monthFormat = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  MONTH_FORMAT = 'MMMM';

  @Input() month!: CalendarMonth;
  @Output() select: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  _onSelect(month: number): void {
    this.select.emit(month);
  }

  getDate(month: number) {
    return new Date(this._thisMonth.getFullYear(), month, 1);
  }
}

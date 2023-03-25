import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { defaultMonths } from '../default-calendar-settings';
import { ICalendarMonth } from '../calendar-interface';

@Component({
  selector: 'month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.scss'],
})
export class MonthPickerComponent implements OnInit {

  dateMonths: string[] = defaultMonths('short');
  currentMonth: Date = new Date();
  activeMonth: boolean = false;
  @Input() month!: ICalendarMonth;
  /** Returns month index */
  @Output() onSelect: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    if (!this.month) {
      throw new Error('No Month Option Provided');
    }
  }

  /** Select month */
  onSelectEvent(month: number): void {
    this.onSelect.emit(month);
  }

  /** Check if class should be applied to the month button */
  selectedMonth(i: number): boolean {
    return i === this.currentMonth.getMonth();
  }

  /** Get month index and return a long month name (ex January) */
  getMonth(i: number): string {
    const monthKey: { [month: number]: string } = {
      [0]: 'January',
      [1]: 'February',
      [2]: 'March',
      [3]: 'April',
      [4]: 'May',
      [5]: 'June',
      [6]: 'July',
      [7]: 'August',
      [8]: 'September',
      [9]: 'October',
      [10]: 'November',
      [11]: 'December'
    }

    return monthKey[i];
  }
}

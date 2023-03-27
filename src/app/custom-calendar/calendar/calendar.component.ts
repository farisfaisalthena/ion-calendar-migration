import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { addDays, addMonths, addYears, format, getDaysInMonth, isAfter, isBefore, isEqual, isSameDay, isToday, subDays, subMonths, subYears } from 'date-fns';

import { ICalendarDay, ICalendarMonth, ICalendarMonthChangeEv, ICalendarOptions, ICalendarOriginal, IDayConfig } from '../calendar-interface';
import { defaultMonthFormat } from '../default-calendar-settings';

@Component({
  selector: 'custom-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements ControlValueAccessor, OnInit {

  currentTimestamp: number = new Date().getTime();
  monthOpt!: ICalendarMonth;
  calendarOpts!: ICalendarOptions;
  viewMode: 'days' | 'month' = 'days';
  calendarMonthValue: Array<ICalendarDay | null> = [null, null];
  arrowIcon: 'caret-down-outline' | 'caret-up-outline' = 'caret-down-outline';
  // Option required
  @Input()
  set options(value: ICalendarOptions) {
    this.calendarOpts = value;
    this.initOpts();
    if (this.monthOpt?.original) {
      this.monthOpt = this.createMonth(this.monthOpt.original.timestamp);
    }
  }
  // Output events
  @Output() onMonthChanged: EventEmitter<ICalendarMonthChangeEv> = new EventEmitter();
  @Output() onDateChanged: EventEmitter<string | object> = new EventEmitter();
  @Output() onDaySelect: EventEmitter<ICalendarDay> = new EventEmitter();
  @Output() onSelectStart: EventEmitter<ICalendarDay> = new EventEmitter();
  @Output() onSelectEnd: EventEmitter<ICalendarDay> = new EventEmitter();
  // Required functions and cannot be moved as its required for ControlValueAccessor
  _onTouched: Function = () => { };
  _onChanged: Function = () => { };

  constructor() { }

  ngOnInit() {
    this.initOpts();

    this.monthOpt = this.createMonth(this.currentTimestamp);
  }

  initOpts(): void {
    this.calendarOpts = this.defaultOpt(this.calendarOpts);
  }

  writeValue(obj: any): void {
    this._writeValue(obj);

    if (!obj) return;

    if (this.calendarMonthValue[0]) {
      this.monthOpt = this.createMonth(this.calendarMonthValue[0].timestamp);
      return;
    }

    this.monthOpt = this.createMonth(this.currentTimestamp);
  }

  registerOnChange(fn: () => {}): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  _writeValue(value: any): void {
    if (!value) {
      this.calendarMonthValue = [null, null];
      return;
    }

    switch (this.calendarOpts.pickerMode) {
      case 'single':
        this.calendarMonthValue[0] = this._createCalendarDay(value);
        break;

      case 'range':
        if (value.from) {
          this.calendarMonthValue[0] = value.from ? this._createCalendarDay(value.from) : null;
        }
        if (value.to) {
          this.calendarMonthValue[1] = value.to ? this._createCalendarDay(value.to) : null;
        }
        break;

      case 'multi':
        if (Array.isArray(value)) {
          this.calendarMonthValue = value.map(e => {
            return this._createCalendarDay(e);
          });
        } else {
          this.calendarMonthValue = [null, null];
        }
        break;

      default:
    }
  }

  _createCalendarDay(value: number): ICalendarDay {
    return this.createCalendarDay(this._payloadToTimeNumber(value), this.calendarOpts);
  }

  _payloadToTimeNumber(value: number): number {
    return new Date(value).getTime();
  }

  createMonth(date: number): ICalendarMonth {
    return this.createMonthsByPeriod(date, 1, this.calendarOpts)[0];
  }

  createMonthsByPeriod(startTime: number, monthsNum: number, opt: ICalendarOptions): Array<ICalendarMonth> {
    let _array: Array<ICalendarMonth> = [];

    let _start = new Date(startTime);
    let _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();

    for (let i = 0; i < monthsNum; i++) {
      let time = addMonths(new Date(_startMonth), i).getTime();
      let originalCalendar = this.createOriginalCalendar(time);

      _array.push(this.createCalendarMonth(originalCalendar, opt));
    }

    return _array;
  }

  createCalendarMonth(original: ICalendarOriginal, opt: ICalendarOptions): ICalendarMonth {
    let days: Array<ICalendarDay> = new Array(6).fill(null);

    for (let i = original.firstWeek; i < original.daysInMonth + original.firstWeek; i++) {
      const itemTime = new Date(original.year, original.month, i - original.firstWeek + 1).getTime();

      days[i] = this.createCalendarDay(itemTime, opt);
    }

    let weekStart = opt.weekStart;

    if (weekStart === 1) {
      if (days[0] === null) {
        days.shift();
      } else {
        days.unshift(...new Array(6).fill(null));
      }
    }

    if (opt.overlapMonths) {
      const booleanArr = days.map(e => !!e);
      const thisMonth = new Date(original.timestamp).getMonth();

      let startOffsetIndex = booleanArr.indexOf(true) - 1;
      let endOffsetIndex = booleanArr.lastIndexOf(true) + 1;
      for (startOffsetIndex; startOffsetIndex >= 0; startOffsetIndex--) {
        const dayBefore = subDays(new Date(days[startOffsetIndex + 1].timestamp), 1).getTime();

        days[startOffsetIndex] = this.createCalendarDay(dayBefore, opt, thisMonth);
      }

      if (!(booleanArr.length % 7 === 0 && booleanArr[booleanArr.length - 1])) {
        for (endOffsetIndex; endOffsetIndex < days.length + (endOffsetIndex % 7); endOffsetIndex++) {
          const dayAfter = addDays(new Date(days[endOffsetIndex - 1].timestamp), 1).getTime();

          days[endOffsetIndex] = this.createCalendarDay(dayAfter, opt, thisMonth);
        }
      }
    }

    const response: ICalendarMonth = {
      days,
      original
    }

    return response;
  }

  createOriginalCalendar(time: number): ICalendarOriginal {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();

    const timestamp = new Date(year, month, 1).getTime();
    const firstWeek = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(new Date(time));

    const response: ICalendarOriginal = {
      timestamp,
      date,
      year,
      month,
      firstWeek,
      daysInMonth
    }
    return response;
  }

  createCalendarDay(timestamp: number, opt: ICalendarOptions, month?: number): ICalendarDay {
    const date = new Date(timestamp);
    const dayConfig = this.findDayConfig(date, opt);
    const rangeStart = new Date(opt.from as Date).getTime();
    const rangeEnd = new Date(opt.to as Date).getTime();
    let isBetween = true;

    const marked = dayConfig ? dayConfig.marked || false : false
    const cssClass = dayConfig ? dayConfig.cssClass || '' : '';
    const disableWeek = opt.disableWeeks!.indexOf(date.getDay()) !== -1;

    let title = new Date(timestamp).getDate().toString();
    if (dayConfig && dayConfig.title) {
      title = dayConfig.title;
    }

    if (rangeStart > 0 && rangeEnd > 0) {
      isBetween = !this.isBetweenTime(date, rangeStart, rangeEnd, '[]');
    } else if (rangeStart > 0 && rangeEnd === 0) {
      let _addTime = addDays(new Date(timestamp), 1);

      isBetween = !isAfter(_addTime, rangeStart);
    }

    const disabled = dayConfig ? dayConfig.disable || false : (disableWeek || isBetween);

    const response: ICalendarDay = {
      timestamp,
      today: isToday(new Date(timestamp)),
      selected: false,
      disabled,
      cssClass,
      isLastMonth: date.getMonth() < month!,
      isNextMonth: date.getMonth() > month!,
      title,
      marked
    }

    return response;
  }

  findDayConfig(day: Date, opt: ICalendarOptions): IDayConfig | null {
    if (opt.daysConfig && opt.daysConfig.length < 1) return null;

    return opt.daysConfig.find(n => isSameDay(day, new Date(n.date)))!;
  }

  monthOnSelect(month: number): void {
    const newMonth = this.monthIndexToDate(month).getTime();
    this.viewMode = 'days';

    this.onMonthChanged.emit({
      oldMonth: format(new Date(this.monthOpt.original.timestamp), 'yyyy-MM-dd'),
      newMonth: format(new Date(newMonth), 'yyyy-MM-dd')
    });

    this.monthOpt = this.createMonth(newMonth);
  }

  monthIndexToDate(monthIndex: number): Date {
    const year = this.monthOpt.original.year; // get current year
    const month = monthIndex; // adjust for 0-based index
    const date = new Date(year, month, 1); // create date object for first day of month

    return date;
  }

  /** Initialise default options */
  defaultOpt(calendarOptions: any = {}): ICalendarOptions {
    const _disableWeeks: number[] = [];
    const _daysConfig: IDayConfig[] = [];
    let {
      from = new Date(),
      to = 0,
      pickerMode = 'single',
      weekStart = 0,
      disableWeeks = _disableWeeks,
      monthFormat = defaultMonthFormat,
      daysConfig = _daysConfig,
      overlapMonths = true,
      showToggleButtons = true
    } = { ...calendarOptions };

    const defaultOpt: ICalendarOptions = {
      from,
      to,
      pickerMode,
      weekStart,
      disableWeeks,
      monthFormat,
      daysConfig,
      overlapMonths,
      showToggleButtons
    }

    return defaultOpt;
  }

  switchMode(): void {
    this.viewMode = this.viewMode === 'days' ? 'month' : 'days';
    this.arrowIcon = this.viewMode === 'days' ? 'caret-down-outline' : 'caret-up-outline';
  }

  /** Format Timestamp */
  monthFormat(timestamp: number) {
    return format(new Date(timestamp), this.calendarOpts.monthFormat || defaultMonthFormat);
  }

  prev(): void {
    if (this.viewMode === 'days') {
      const backTime = subMonths(new Date(this.monthOpt.original.timestamp), 1).getTime();

      this.onMonthChanged.emit({
        oldMonth: format(new Date(this.monthOpt.original.timestamp), 'yyyy-MM-dd'),
        newMonth: format(new Date(backTime), 'yyyy-MM-dd')
      });

      this.monthOpt = this.createMonth(backTime);

      return;
    }

    const originalTime = new Date(this.monthOpt.original.timestamp);

    if (originalTime.getFullYear() === 1970) return;

    const backTime = subYears(new Date(this.monthOpt.original.timestamp), 1).getTime();

    this.monthOpt = this.createMonth(backTime);
  }

  next(): void {
    if (this.viewMode === 'days') {
      const nextTime = addMonths(new Date(this.monthOpt.original.timestamp), 1).getTime();

      this.onMonthChanged.emit({
        oldMonth: format(new Date(this.monthOpt.original.timestamp), 'yyyy-MM-dd'),
        newMonth: format(new Date(nextTime), 'yyyy-MM-dd')
      });

      this.monthOpt = this.createMonth(nextTime);

      return;
    }

    const nextYear = addYears(new Date(this.monthOpt.original.timestamp), 1).getTime();

    this.monthOpt = this.createMonth(nextYear);
  }

  onChanged($event: ICalendarDay[]): void {
    switch (this.calendarOpts.pickerMode) {
      case 'single':
        const date = this.formatDate($event[0].timestamp);

        this._onChanged(date);
        this.onDateChanged.emit(date);
        break;

      case 'range':
        if ($event[0] && $event[1]) {
          const rangeDate = {
            from: this.formatDate($event[0].timestamp),
            to: this.formatDate($event[1].timestamp),
          };

          this._onChanged(rangeDate);
          this.onDateChanged.emit(rangeDate);
        }
        break;

      case 'multi':
        const dates = [];

        for (let i = 0; i < $event.length; i++) {
          if ($event[i] && $event[i].timestamp) {
            dates.push(this.formatDate($event[i].timestamp));
          }
        }

        this._onChanged(dates);
        this.onDateChanged.emit(dates);
        break;

      default:
    }
  }

  formatDate(timestamp: number): string {
    return format(new Date(timestamp), 'yyyy-MM-dd')
  }

  isBetweenTime(date: Date, from: number, to: number, inclusivity = '()'): boolean {
    if (!['()', '[]', '(]', '[)'].includes(inclusivity)) {
      throw new Error('Inclusivity parameter must be one of (), [], (], [)');
    }

    const isBeforeEqual = inclusivity[0] === '[',
      isAfterEqual = inclusivity[1] === ']';

    return (isBeforeEqual ? (isEqual(from, date) || isBefore(from, date)) : isBefore(from, date)) &&
      (isAfterEqual ? (isEqual(to, date) || isAfter(to, date)) : isAfter(to, date));
  };

  get canGoBack(): boolean {
    if (!this.calendarOpts.from || this.viewMode !== 'days') return true;

    return this.monthOpt.original.timestamp > new Date(this.calendarOpts.from).getTime();
  }

  get canGoNext(): boolean {
    if (!this.calendarOpts.to || this.viewMode !== 'days') return true;

    return this.monthOpt.original.timestamp < new Date(this.calendarOpts.to).getTime();
  }
}

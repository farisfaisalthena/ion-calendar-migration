import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { addDays, addMonths, format, getDaysInMonth, isSameDay, isToday, subDays } from 'date-fns';

import { CalendarComponentPayloadTypes, CalendarComponentTypeProperty } from 'src/app/components/calendar/calendar.component';
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



  // _d!: ICalendarModalOptions;
  // _options!: CalendarComponentOptions;
  // private readonly defaultOpts!: CalendarModalOptions;



  type: CalendarComponentTypeProperty = 'string';
  _showToggleButtons = true;
  // _view: 'month' | 'days' = 'days';


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
  // Required functions and cannot be moved as its required for ControlValueAccessor
  _onTouched: Function = () => { };
  _onChanged: Function = () => { };

  set showToggleButtons(value: boolean) {
    this._showToggleButtons = value;
  }

  set showMonthPicker(value: boolean) {
    this._showMonthPicker = value;
  }

  _showMonthPicker = true;
  get showMonthPicker(): boolean {
    return this._showMonthPicker;
  }

  constructor() { }

  ngOnInit() {
    this.initOpts();

    this.monthOpt = this.createMonth(this.currentTimestamp);
  }

  initOpts(): void {
    if (this.calendarOpts && typeof this.calendarOpts.showToggleButtons === 'boolean') {
      this.showToggleButtons = this.calendarOpts.showToggleButtons;
    }
    if (this.calendarOpts && typeof this.calendarOpts.showMonthPicker === 'boolean') {
      this.showMonthPicker = this.calendarOpts.showMonthPicker;

      if (this.viewMode !== 'days' && !this.showMonthPicker) {
        this.viewMode = 'days';
      }
    }

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

  _createCalendarDay(value: CalendarComponentPayloadTypes): ICalendarDay {
    return this.createCalendarDay(this._payloadToTimeNumber(value), this.calendarOpts);
  }

  _payloadToTimeNumber(value: CalendarComponentPayloadTypes): number {
    let date;
    if (this.type === 'string') {
      date = format(new Date(value as number), 'yyyy-MM-dd');
      // date = moment(value, this.format);
    } else {
      date = new Date(value as number).getTime();
      // date = moment(value);
    }
    // return date.valueOf();
    return date as number;
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
    const marked = dayConfig ? dayConfig.marked || false : false
    const cssClass = dayConfig ? dayConfig.cssClass || '' : '';

    let title = new Date(timestamp).getDate().toString();
    if (dayConfig && dayConfig.title) {
      title = dayConfig.title;
    }
    let disabled = false;
    let isBetween = true;
    let disableWeek = opt.disableWeeks!.indexOf(date.getDay()) !== -1;
    if (dayConfig && !!dayConfig.disable) {
      disabled = dayConfig.disable;
    } else {
      disabled = disableWeek || isBetween;
    }

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

    // let _isToday = ;


    // let _rangeBeg = new Date(opt.from as Date).getTime();
    // let _rangeEnd = new Date(opt.to as Date).getTime();

    // let disableWee = opt.disableWeeks!.indexOf(date.getDay()) !== -1;

    // if (_rangeBeg > 0 && _rangeEnd > 0) {
    //   isBetween = isBefore(new Date(time), _rangeBeg) ? false : isBetween;
    // if (!opt.canBackwardsSelected) {
    //   isBetween = !this.isBetweenTime(date, _rangeBeg, _rangeEnd, '[]');
    // } else {
    // }
    // } else if (_rangeBeg > 0 && _rangeEnd === 0) {
    //   isBetween = false;
    // if (!opt.canBackwardsSelected) {
    //   let _addTime = addDays(new Date(time), 1);

    //   isBetween = !isAfter(_addTime, _rangeBeg);
    // } else {
    // }
    // }

    // let _disable = false;




    // else if (opt.defaultTitle) {
    //   title = opt.defaultTitle;
    // }
    // let subTitle = '';
    // if (dayConfig && dayConfig.subTitle) {
    //   subTitle = dayConfig.subTitle;
    // }
    // else if (opt.defaultSubtitle) {
    //   subTitle = opt.defaultSubtitle;
    // }

    // return {
    //   timestamp,
    //   isToday: _isToday,
    //   title,
    //   subTitle,
    //   selected: false,
    //   isLastMonth: date.getMonth() < month!,
    //   isNextMonth: date.getMonth() > month!,
    //   marked: dayConfig ? dayConfig.marked || false : false,
    //   cssClass: dayConfig ? dayConfig.cssClass || '' : '',
    //   disable: _disable,
    //   isFirst: date.getDate() === 1,
    //   isLast: date.getDate() === getDaysInMonth(new Date(time)),
    // };
  }

  findDayConfig(day: Date, opt: ICalendarOptions): IDayConfig | null | undefined {
    if (opt.daysConfig && opt.daysConfig.length < 1) return null;

    return opt.daysConfig.find(n => isSameDay(day, new Date(n.date)));
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
      showToggleButtons = true,
      showMonthPicker = true
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
      showToggleButtons,
      showMonthPicker
    }

    return defaultOpt;
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { addDays, addMonths, format, getDaysInMonth, isBefore, isSameDay, isToday, subDays } from 'date-fns';

import { CalendarComponentPayloadTypes, CalendarComponentTypeProperty } from 'src/app/components/calendar/calendar.component';
import { CalendarOriginal, CalendarDay } from 'src/app/components/month-picker/month-picker.component';
import { defaultMonthFormat } from '../default-calendar-settings';
import { ICalendarMonth, ICalendarMonthChangeEv, ICalendarOptionsV2 } from '../interfaces';
import { IDayConfig } from '../interfaces/calendar-option';

@Component({
  selector: 'custom-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements ControlValueAccessor, OnInit {

  currentTimestamp: number = new Date().getTime();
  monthOpt!: ICalendarMonth;
  calendarOpts!: ICalendarOptionsV2;



  // _d!: ICalendarModalOptions;
  // _options!: CalendarComponentOptions;
  // private readonly defaultOpts!: CalendarModalOptions;



  _calendarMonthValue: Array<CalendarDay | null> = [null, null];
  type: CalendarComponentTypeProperty = 'string';
  _showToggleButtons = true;
  _view: 'month' | 'days' = 'days';
  // Option required
  @Input()
  set options(value: ICalendarOptionsV2) {
    this.calendarOpts = value;
    this.initOpts();
    if (this.monthOpt?.original) {
      this.monthOpt = this.createMonth(this.monthOpt.original.time);
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
      if (this._view !== 'days' && !this.showMonthPicker) {
        this._view = 'days';
      }
    }

    this.calendarOpts = this.defaultOpt(this.calendarOpts);
  }

  writeValue(obj: any): void {
    this._writeValue(obj);

    if (!obj) return;

    if (this._calendarMonthValue[0]) {
      this.monthOpt = this.createMonth(this._calendarMonthValue[0].time);
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
      this._calendarMonthValue = [null, null];
      return;
    }

    switch (this.calendarOpts.pickerMode) {
      case 'single':
        this._calendarMonthValue[0] = this._createCalendarDay(value);
        break;

      case 'range':
        if (value.from) {
          this._calendarMonthValue[0] = value.from ? this._createCalendarDay(value.from) : null;
        }
        if (value.to) {
          this._calendarMonthValue[1] = value.to ? this._createCalendarDay(value.to) : null;
        }
        break;

      case 'multi':
        if (Array.isArray(value)) {
          this._calendarMonthValue = value.map(e => {
            return this._createCalendarDay(e);
          });
        } else {
          this._calendarMonthValue = [null, null];
        }
        break;

      default:
    }
  }

  _createCalendarDay(value: CalendarComponentPayloadTypes): CalendarDay {
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

  createMonthsByPeriod(startTime: number, monthsNum: number, opt: ICalendarOptionsV2): Array<ICalendarMonth> {
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

  createCalendarMonth(original: CalendarOriginal, opt: ICalendarOptionsV2): ICalendarMonth {
    let days: Array<CalendarDay> = new Array(6).fill(null);
    let len = original.howManyDays;
    for (let i = original.firstWeek; i < len + original.firstWeek; i++) {
      let itemTime = new Date(original.year, original.month, i - original.firstWeek + 1).getTime();
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
      const _booleanMap = days.map(e => !!e);
      const thisMonth = new Date(original.time).getMonth();

      let startOffsetIndex = _booleanMap.indexOf(true) - 1;
      let endOffsetIndex = _booleanMap.lastIndexOf(true) + 1;
      for (startOffsetIndex; startOffsetIndex >= 0; startOffsetIndex--) {
        const dayBefore = subDays(new Date(days[startOffsetIndex + 1].time), 1).getTime();

        days[startOffsetIndex] = this.createCalendarDay(dayBefore, opt, thisMonth);
      }

      if (!(_booleanMap.length % 7 === 0 && _booleanMap[_booleanMap.length - 1])) {
        for (endOffsetIndex; endOffsetIndex < days.length + (endOffsetIndex % 7); endOffsetIndex++) {
          const dayAfter = addDays(new Date(days[endOffsetIndex - 1].time), 1).getTime();

          days[endOffsetIndex] = this.createCalendarDay(dayAfter, opt, thisMonth);
        }
      }
    }

    return {
      days,
      original: original,
    };
  }

  createOriginalCalendar(time: number): CalendarOriginal {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstWeek = new Date(year, month, 1).getDay();
    const howManyDays = getDaysInMonth(new Date(time));
    return {
      year,
      month,
      firstWeek,
      howManyDays,
      time: new Date(year, month, 1).getTime(),
      date: new Date(time),
    };
  }

  createCalendarDay(time: number, opt: ICalendarOptionsV2, month?: number): CalendarDay {
    const date = new Date(time);

    let _isToday = isToday(new Date(time));
    let dayConfig = this.findDayConfig(date, opt);

    let _rangeBeg = new Date(opt.from as Date).getTime();
    let _rangeEnd = new Date(opt.to as Date).getTime();
    let isBetween = true;
    let disableWee = opt.disableWeeks!.indexOf(date.getDay()) !== -1;

    if (_rangeBeg > 0 && _rangeEnd > 0) {
      isBetween = isBefore(new Date(time), _rangeBeg) ? false : isBetween;
      // if (!opt.canBackwardsSelected) {
      //   isBetween = !this.isBetweenTime(date, _rangeBeg, _rangeEnd, '[]');
      // } else {
      // }
    } else if (_rangeBeg > 0 && _rangeEnd === 0) {
      isBetween = false;
      // if (!opt.canBackwardsSelected) {
      //   let _addTime = addDays(new Date(time), 1);

      //   isBetween = !isAfter(_addTime, _rangeBeg);
      // } else {
      // }
    }

    let _disable = false;

    if (dayConfig && !!dayConfig.disable) {
      _disable = dayConfig.disable;
    } else {
      _disable = disableWee || isBetween;
    }

    let title = new Date(time).getDate().toString();
    if (dayConfig && dayConfig.title) {
      title = dayConfig.title;
    }
    // else if (opt.defaultTitle) {
    //   title = opt.defaultTitle;
    // }
    let subTitle = '';
    // if (dayConfig && dayConfig.subTitle) {
    //   subTitle = dayConfig.subTitle;
    // }
    // else if (opt.defaultSubtitle) {
    //   subTitle = opt.defaultSubtitle;
    // }

    return {
      time,
      isToday: _isToday,
      title,
      subTitle,
      selected: false,
      isLastMonth: date.getMonth() < month!,
      isNextMonth: date.getMonth() > month!,
      marked: dayConfig ? dayConfig.marked || false : false,
      cssClass: dayConfig ? dayConfig.cssClass || '' : '',
      disable: _disable,
      isFirst: date.getDate() === 1,
      isLast: date.getDate() === getDaysInMonth(new Date(time)),
    };
  }

  findDayConfig(day: Date, opt: ICalendarOptionsV2): IDayConfig | null | undefined {
    if (opt.daysConfig && opt.daysConfig.length < 1) return null;

    return opt.daysConfig.find(n => isSameDay(day, new Date(n.date)));
  }

  monthOnSelect(month: number): void {
    const newMonth = this.monthIndexToDate(month).getTime();
    this._view = 'days';

    this.onMonthChanged.emit({
      oldMonth: format(new Date(this.monthOpt.original.time), 'yyyy-MM-dd'),
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
  defaultOpt(calendarOptions: any = {}): ICalendarOptionsV2 {
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

    const defaultOpt: ICalendarOptionsV2 = {
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

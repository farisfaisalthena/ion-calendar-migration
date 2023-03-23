import { Component, EventEmitter, forwardRef, Input, OnInit, Output, Provider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
import { CalendarDay, CalendarMonth, CalendarOriginal } from '../month-picker/month-picker.component';

const isBoolean = (input: any) => input === true || input === false;

export type DefaultDate = Date | string | number | null;

export type CalendarComponentPayloadTypes = string | Date | number | {};

export type CalendarComponentTypeProperty = 'string' | 'js-date' | 'moment' | 'time' | 'object';

export interface CalendarModalOptions extends CalendarOptions {
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

export class CalendarResult {
  time!: number;
  unix!: number;
  dateObj!: Date;
  string!: string;
  years!: number;
  months!: number;
  date!: number;
}

export class CalendarComponentMonthChange {
  oldMonth!: CalendarResult;
  newMonth!: CalendarResult;
}

export interface DayConfig {
  date: Date;
  marked?: boolean;
  disable?: boolean;
  title?: string;
  subTitle?: string;
  cssClass?: string;
}

export interface CalendarOptions {
  from?: Date | number;
  to?: Date | number;
  pickMode?: string;
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

export interface CalendarComponentOptions extends CalendarOptions {
  showToggleButtons?: boolean;
  showMonthPicker?: boolean;
  monthPickerFormat?: string[];
}

interface HighlitedDate {
  date: string;
  textColor: string;
  backgroundColor: string;
}

export const ION_CAL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CalendarComponent),
  multi: true,
};

@Component({
  selector: 'ion-calendar',
  providers: [ION_CAL_VALUE_ACCESSOR],
  // host: {
  //   '[class.component-mode]': 'componentMode'
  // },
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent  implements ControlValueAccessor, OnInit {

  @Output()
  select: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectStart: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectEnd: EventEmitter<CalendarDay> = new EventEmitter();
  @Input()
  type: CalendarComponentTypeProperty = 'string';
  _calendarMonthValue: Array<CalendarDay | null> = [null, null];
  private readonly defaultOpts!: CalendarModalOptions;
  get DEFAULT_STEP() {
    return 12;
  }
  _view: 'month' | 'days' = 'days';

  @Input()
  format: string = 'YYYY-MM-DD';

  @Output()
  change: EventEmitter<CalendarComponentPayloadTypes> = new EventEmitter();

  monthOpt!: CalendarMonth;
  _d!: CalendarModalOptions;
  _options!: CalendarComponentOptions;

  @Input()
  readonly = false;

  @Output()
  monthChange: EventEmitter<CalendarComponentMonthChange> = new EventEmitter();

  _showToggleButtons = true;

  constructor() {
  }

  @Input()
  set options(value: CalendarComponentOptions) {
    this._options = value;
    this.initOpt();
    if (this.monthOpt && this.monthOpt.original) {
      this.monthOpt = this.createMonth(this.monthOpt.original.time);
    }
  }

  writeValue(obj: any): void {
    this._writeValue(obj);
    if (obj) {
      if (this._calendarMonthValue[0]) {
        this.monthOpt = this.createMonth(this._calendarMonthValue[0].time);
      } else {
        this.monthOpt = this.createMonth(new Date().getTime());
      }
    }
  }

  registerOnChange(fn: () => {}): void {
    this._onChanged = fn;
  }

  _onTouched: Function = () => {};

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  _writeValue(value: any): void {
    if (!value) {
      this._calendarMonthValue = [null, null];
      return;
    }

    switch (this._d.pickMode) {
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

  _payloadToTimeNumber(value: CalendarComponentPayloadTypes): number {
    let date;
    if (this.type === 'string') {
      date = moment(value, this.format);
    } else {
      date = moment(value);
    }
    return date.valueOf();
  }

  _createCalendarDay(value: CalendarComponentPayloadTypes): CalendarDay {
    return this.createCalendarDay(this._payloadToTimeNumber(value), this._d);
  }

  get options(): CalendarComponentOptions {
    return this._options;
  }


  monthOnSelect(month: number): void {
    this._view = 'days';
    const newMonth = moment(this.monthOpt.original.time)
      .month(month)
      .valueOf();
    this.monthChange.emit({
      oldMonth: this.multiFormat(this.monthOpt.original.time),
      newMonth: this.multiFormat(newMonth),
    });
    this.monthOpt = this.createMonth(newMonth);
  }

  ngOnInit(): void {
    this.initOpt();
    this.monthOpt = this.createMonth(new Date().getTime());

    console.log('HHHH: ', this.monthOpt)
  }

  private initOpt(): void {
    if (this._options && typeof this._options.showToggleButtons === 'boolean') {
      this.showToggleButtons = this._options.showToggleButtons;
    }
    if (this._options && typeof this._options.showMonthPicker === 'boolean') {
      this.showMonthPicker = this._options.showMonthPicker;
      if (this._view !== 'days' && !this.showMonthPicker) {
        this._view = 'days';
      }
    }
    this._d = this.safeOpt(this._options || {});
  }

  swipeEvent($event: any): void {
    const isNext = $event.deltaX < 0;
    if (isNext && this.canNext()) {
      this.nextMonth();
    } else if (!isNext && this.canBack()) {
      this.backMonth();
    }
  }

  safeOpt(calendarOptions: any = {}): CalendarModalOptions {
    const _disableWeeks: number[] = [];
    const _daysConfig: DayConfig[] = [];
    let {
      from = new Date(),
      to = 0,
      weekStart = 0,
      step = this.DEFAULT_STEP,
      id = '',
      cssClass = '',
      closeLabel = 'CANCEL',
      doneLabel = 'DONE',
      monthFormat = 'MMM YYYY',
      title = 'CALENDAR',
      defaultTitle = '',
      defaultSubtitle = '',
      autoDone = false,
      canBackwardsSelected = false,
      closeIcon = false,
      doneIcon = false,
      showYearPicker = false,
      isSaveHistory = false,
      pickMode = 'single',
      color = 'primary',
      weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      daysConfig = _daysConfig,
      disableWeeks = _disableWeeks,
      showAdjacentMonthDay = true,
      defaultEndDateToStartDate = false,
      clearLabel = null,
    } = { ...this.defaultOpts, ...calendarOptions };

    return {
      id,
      from,
      to,
      pickMode,
      autoDone,
      color,
      cssClass,
      weekStart,
      closeLabel,
      closeIcon,
      doneLabel,
      doneIcon,
      canBackwardsSelected,
      isSaveHistory,
      disableWeeks,
      monthFormat,
      title,
      weekdays,
      daysConfig,
      step,
      showYearPicker,
      defaultTitle,
      defaultSubtitle,
      defaultScrollTo: calendarOptions.defaultScrollTo || from,
      defaultDate: calendarOptions.defaultDate || null,
      defaultDates: calendarOptions.defaultDates || null,
      defaultDateRange: calendarOptions.defaultDateRange || null,
      showAdjacentMonthDay,
      defaultEndDateToStartDate,
      clearLabel
    };
  }

  set showToggleButtons(value: boolean) {
    this._showToggleButtons = value;
  }

  _monthFormat(date: number): string {
    return moment(date).format(this._d.monthFormat!.replace(/y/g, 'Y'));
  }

  getDate(date: number) {
    return new Date(date);
  }

  switchView(): void {
    this._view = this._view === 'days' ? 'month' : 'days';
  }

  canBack(): boolean {
    if (!this._d.from || this._view !== 'days') { return true; }
    return this.monthOpt.original.time > moment(this._d.from).valueOf();
  }

  canNext(): boolean {
    if (!this._d.to || this._view !== 'days') { return true; }
    return this.monthOpt.original.time < moment(this._d.to).valueOf();
  }

  prev(): void {
    if (this._view === 'days') {
      this.backMonth();
    } else {
      this.prevYear();
    }
  }

  next(): void {
    if (this._view === 'days') {
      this.nextMonth();
    } else {
      this.nextYear();
    }
  }

  nextYear(): void {
    const nextTime = moment(this.monthOpt.original.time)
      .add(1, 'year')
      .valueOf();
    this.monthOpt = this.createMonth(nextTime);
  }

  nextMonth(): void {
    const nextTime = moment(this.monthOpt.original.time)
      .add(1, 'months')
      .valueOf();
    this.monthChange.emit({
      oldMonth: this.multiFormat(this.monthOpt.original.time),
      newMonth: this.multiFormat(nextTime),
    });
    this.monthOpt = this.createMonth(nextTime);
  }

  prevYear(): void {
    if (moment(this.monthOpt.original.time).year() === 1970) { return; }
    const backTime = moment(this.monthOpt.original.time)
      .subtract(1, 'year')
      .valueOf();
    this.monthOpt = this.createMonth(backTime);
  }

  backMonth(): void {
    const backTime = moment(this.monthOpt.original.time)
      .subtract(1, 'months')
      .valueOf();
    this.monthChange.emit({
      oldMonth: this.multiFormat(this.monthOpt.original.time),
      newMonth: this.multiFormat(backTime),
    });
    this.monthOpt = this.createMonth(backTime);
  }

  set showMonthPicker(value: boolean) {
    this._showMonthPicker = value;
  }

  createMonth(date: number): CalendarMonth {
    return this.createMonthsByPeriod(date, 1, this._d)[0];
  }

  _showMonthPicker = true;
  get showMonthPicker(): boolean {
    return this._showMonthPicker;
  }

  createMonthsByPeriod(startTime: number, monthsNum: number, opt: CalendarModalOptions): Array<CalendarMonth> {
    let _array: Array<CalendarMonth> = [];

    let _start = new Date(startTime);
    let _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();

    for (let i = 0; i < monthsNum; i++) {
      let time = moment(_startMonth)
        .add(i, 'M')
        .valueOf();
      let originalCalendar = this.createOriginalCalendar(time);
      _array.push(this.createCalendarMonth(originalCalendar, opt));
    }

    return _array;
  }

  createCalendarMonth(original: CalendarOriginal, opt: CalendarModalOptions): CalendarMonth {
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

    if (opt.showAdjacentMonthDay) {
      const _booleanMap = days.map(e => !!e);
      const thisMonth = moment(original.time).month();
      let startOffsetIndex = _booleanMap.indexOf(true) - 1;
      let endOffsetIndex = _booleanMap.lastIndexOf(true) + 1;
      for (startOffsetIndex; startOffsetIndex >= 0; startOffsetIndex--) {
        const dayBefore = moment(days[startOffsetIndex + 1].time)
          .clone()
          .subtract(1, 'd');
        days[startOffsetIndex] = this.createCalendarDay(dayBefore.valueOf(), opt, thisMonth);
      }

      if (!(_booleanMap.length % 7 === 0 && _booleanMap[_booleanMap.length - 1])) {
        for (endOffsetIndex; endOffsetIndex < days.length + (endOffsetIndex % 7); endOffsetIndex++) {
          const dayAfter = moment(days[endOffsetIndex - 1].time)
            .clone()
            .add(1, 'd');
          days[endOffsetIndex] = this.createCalendarDay(dayAfter.valueOf(), opt, thisMonth);
        }
      }
    }

    return {
      days,
      original: original,
    };
  }

  createCalendarDay(time: number, opt: CalendarModalOptions, month?: number): CalendarDay {
    let _time = moment(time);
    let date = moment(time);
    let isToday = moment().isSame(_time, 'days');
    let dayConfig = this.findDayConfig(_time, opt);
    let _rangeBeg = moment(opt.from).valueOf();
    let _rangeEnd = moment(opt.to).valueOf();
    let isBetween = true;
    let disableWee = opt.disableWeeks!.indexOf(_time.toDate().getDay()) !== -1;
    if (_rangeBeg > 0 && _rangeEnd > 0) {
      if (!opt.canBackwardsSelected) {
        isBetween = !_time.isBetween(_rangeBeg, _rangeEnd, 'days', '[]');
      } else {
        isBetween = moment(_time).isBefore(_rangeBeg) ? false : isBetween;
      }
    } else if (_rangeBeg > 0 && _rangeEnd === 0) {
      if (!opt.canBackwardsSelected) {
        let _addTime = _time.add(1, 'day');
        isBetween = !_addTime.isAfter(_rangeBeg);
      } else {
        isBetween = false;
      }
    }

    let _disable = false;

    if (dayConfig && isBoolean(dayConfig.disable)) {
      _disable = dayConfig.disable;
    } else {
      _disable = disableWee || isBetween;
    }

    let title = new Date(time).getDate().toString();
    if (dayConfig && dayConfig.title) {
      title = dayConfig.title;
    } else if (opt.defaultTitle) {
      title = opt.defaultTitle;
    }
    let subTitle = '';
    if (dayConfig && dayConfig.subTitle) {
      subTitle = dayConfig.subTitle;
    } else if (opt.defaultSubtitle) {
      subTitle = opt.defaultSubtitle;
    }

    return {
      time,
      isToday,
      title,
      subTitle,
      selected: false,
      isLastMonth: date.month() < month!,
      isNextMonth: date.month() > month!,
      marked: dayConfig ? dayConfig.marked || false : false,
      cssClass: dayConfig ? dayConfig.cssClass || '' : '',
      disable: _disable,
      isFirst: date.date() === 1,
      isLast: date.date() === date.daysInMonth(),
    };
  }

  findDayConfig(day: any, opt: CalendarModalOptions): any {
    if (opt.daysConfig!.length <= 0) return null;
    return opt.daysConfig!.find(n => day.isSame(n.date, 'day'));
  }

  createOriginalCalendar(time: number): CalendarOriginal {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstWeek = new Date(year, month, 1).getDay();
    const howManyDays = moment(time).daysInMonth();
    return {
      year,
      month,
      firstWeek,
      howManyDays,
      time: new Date(year, month, 1).getTime(),
      date: new Date(time),
    };
  }

  multiFormat(time: number): CalendarResult {
    const _moment = moment(time);
    return {
      time: _moment.valueOf(),
      unix: _moment.unix(),
      dateObj: _moment.toDate(),
      string: _moment.format('YYYY-MM-DD'),
      years: _moment.year(),
      months: _moment.month() + 1,
      date: _moment.date(),
    };
  }

  _handleType(value: number): CalendarComponentPayloadTypes {
    const date = moment(value);
    switch (this.type) {
      case 'string':
        return date.format(this.format);
      case 'js-date':
        return date.toDate();
      case 'moment':
        return date;
      case 'time':
        return date.valueOf();
      case 'object':
        return date.toObject();
    }
    return date;
  }

  _onChanged: Function = () => {};

  onChanged($event: CalendarDay[]): void {
    switch (this._d.pickMode) {
      case 'single':
        const date = this._handleType($event[0].time);
        this._onChanged(date);
        this.change.emit(date);
        break;

      case 'range':
        if ($event[0] && $event[1]) {
          const rangeDate = {
            from: this._handleType($event[0].time),
            to: this._handleType($event[1].time),
          };
          this._onChanged(rangeDate);
          this.change.emit(rangeDate);
        }
        break;

      case 'multi':
        const dates = [];

        for (let i = 0; i < $event.length; i++) {
          if ($event[i] && $event[i].time) {
            dates.push(this._handleType($event[i].time));
          }
        }

        this._onChanged(dates);
        this.change.emit(dates);
        break;

      default:
    }
  }

}

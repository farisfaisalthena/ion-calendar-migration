import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { CalendarDay, CalendarMonth, CalendarOriginal } from '../month-picker/month-picker.component';
import * as moment from 'moment';
import { CalendarComponentMonthChange, CalendarModalOptions, CalendarResult } from '../calendar/calendar.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TrackByFunction } from '@angular/core';

export const MONTH_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CalendarMonthComponent),
  multi: true,
};
const isBoolean = (input: any) => input === true || input === false;

@Component({
  selector: 'ion-calendar-month',
  providers: [MONTH_VALUE_ACCESSOR],
  host: {
    '[class.component-mode]': 'componentMode'
  },
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.scss'],
})
export class CalendarMonthComponent  implements ControlValueAccessor, AfterViewInit {

  @Input() color: string = 'primary';
  @Input() pickMode: "multi" | "single" | "range" = 'single';
  @Input() month!: CalendarMonth;
  @Input() readonly = false;
  @Input() componentMode = false;

  @Output()
  change: EventEmitter<CalendarDay[]> = new EventEmitter();
  @Output()
  select: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectStart: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectEnd: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  monthChange: EventEmitter<CalendarComponentMonthChange> = new EventEmitter();

  monthOpt!: CalendarMonth;
  _d!: CalendarModalOptions;
  _view: 'month' | 'days' = 'days';

  readonly DAY_DATE_FORMAT = 'MMMM dd, yyyy';

  _date: Array<CalendarDay | null> = [null, null];

  _isInit = false;

  _onChanged!: Function;
  _onTouched!: Function;

  get _isRange(): boolean {
    return this.pickMode === 'range';
  }

  trackByTime: TrackByFunction<any> = (index: number, item: CalendarOriginal) => item ? item.time : index;

  constructor(public ref: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this._isInit = true;
  }

  get value() {
    return this._date;
  }

  isStartSelection(day: CalendarDay): boolean {
    if (!day) return false;
    if (this.pickMode !== 'range' || !this._isInit || this._date[0] === null) {
      return false;
    }

    return this._date[0].time === day.time && this._date[1] !== null;
  }

  isEndSelection(day: CalendarDay) {
    if (!day) return false;
    if (this.pickMode !== 'range' || !this._isInit || this._date[1] === null) {
      return false;
    }

    return this._date[1].time === day.time;
  }

  writeValue(obj: any): void {
    if (Array.isArray(obj)) {
      this._date = obj;
    }
  }

  registerOnChange(fn: any): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  canNext(): boolean {
    if (!this._d.to || this._view !== 'days') { return true; }
    return this.monthOpt.original.time < moment(this._d.to).valueOf();
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

  createMonth(date: number): CalendarMonth {
    return this.createMonthsByPeriod(date, 1, this._d)[0];
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

  canBack(): boolean {
    if (!this._d.from || this._view !== 'days') { return true; }
    return this.monthOpt.original.time > moment(this._d.from).valueOf();
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

  isBetween(day: CalendarDay): boolean {
    if (!day) return false;

    if (this.pickMode !== 'range' || !this._isInit) {
      return false;
    }

    if (this._date[0] === null || this._date[1] === null) {
      return false;
    }

    const start = this._date[0].time;
    const end = this._date[1].time;

    return day.time < end && day.time > start;
  }

  onSelected(item: CalendarDay) {
    if (this.readonly) return;
    item.selected = true;
    this.select.emit(item);
    if (this.pickMode === 'single') {
      this._date[0] = item;
      this.change.emit(this._date as any);
      return;
    }

    if (this.pickMode === 'range') {
      if (this._date[0] === null) {
        this._date[0] = item;
        this.selectStart.emit(item);
      } else if (this._date[1] === null) {
        if (this._date[0].time < item.time) {
          this._date[1] = item;
          this.selectEnd.emit(item);
        } else {
          this._date[1] = this._date[0];
          this.selectEnd.emit(this._date[0]);
          this._date[0] = item;
          this.selectStart.emit(item);
        }
      } else if (this._date[0].time > item.time) {
        this._date[0] = item;
        this.selectStart.emit(item);
      } else if (this._date[1].time < item.time) {
        this._date[1] = item;
        this.selectEnd.emit(item);
      } else {
        this._date[0] = item;
        this.selectStart.emit(item);
        this._date[1] = null;
      }

      this.change.emit(this._date as any);
      return;
    }

    if (this.pickMode === 'multi') {
      const index = this._date.findIndex(e => e !== null && e.time === item.time);

      if (index === -1) {
        this._date.push(item);
      } else {
        this._date.splice(index, 1);
      }
      this.change.emit(this._date.filter(e => e !== null) as any);
    }
  }

  isSelected(time: number) {
    // console.log({time});

    if (Array.isArray(this._date)) {
      if (this.pickMode !== 'multi') {
        if (this._date[0] !== null) {
          // console.log(this._date[0]);
          // console.log('');

          return time === this._date[0].time;
        }

        if (this._date[1] !== null) {
          return time === this._date[1].time;
        }
      } else {
        return this._date.findIndex(e => e !== null && e.time === time) !== -1;
      }
      return this._date.findIndex(e => e !== null && e.time === time) !== -1;
    } else {
      return false;
    }
  }

  getDayLabel(day: CalendarDay) {
    return new Date(day.time);
  }
}

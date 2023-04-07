import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { CalendarDay, CalendarMonth, CalendarOriginal } from '../month-picker/month-picker.component';
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

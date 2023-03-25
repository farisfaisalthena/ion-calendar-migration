import { AfterViewInit, Component, EventEmitter, forwardRef, Input, Output, TrackByFunction } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ICalendarDay, ICalendarMonth, ICalendarOriginal } from '../interfaces';
import { Color, PickerMode } from '../types';

export const MONTH_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CalendarDaysComponent),
  multi: true,
};

@Component({
  selector: 'calendar-days',
  providers: [MONTH_VALUE_ACCESSOR],
  templateUrl: './calendar-days.component.html',
  styleUrls: ['./calendar-days.component.scss'],
})
export class CalendarDaysComponent implements ControlValueAccessor, AfterViewInit {
  // Required Input type
  @Input() color: Color = 'primary';
  @Input() pickerMode: PickerMode = 'single';
  @Input() selectedMonth!: ICalendarMonth;
  // Available outputs
  @Output() onDaySelect: EventEmitter<ICalendarDay> = new EventEmitter();
  @Output() onChange: EventEmitter<ICalendarDay[]> = new EventEmitter();
  @Output() onSelectStart: EventEmitter<ICalendarDay> = new EventEmitter();
  @Output() onSelectEnd: EventEmitter<ICalendarDay> = new EventEmitter();
  // Other variables
  rangeMode: boolean = this.pickerMode === 'range';
  initialised: boolean = false;
  trackByTime: TrackByFunction<any> = (index: number, item: ICalendarOriginal) => item ? item.timestamp : index;
  dateArr: Array<ICalendarDay | null> = [null, null]; // Interface type has to be defined this way instead of ICalendarDay[] | null
  // Required functions and cannot be moved as its required for ControlValueAccessor
  _onTouched: Function = () => { };
  _onChanged: Function = () => { };

  constructor() { }

  ngAfterViewInit(): void {
    this.initialised = true;
  }

  writeValue(obj: any): void {
    if (Array.isArray(obj)) {
      this.dateArr = obj;
    }
  }

  registerOnChange(fn: any): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  isStartSelection(day: ICalendarDay): boolean {
    if (!day) return false;

    if (this.pickerMode !== 'range' || !this.initialised || this.dateArr[0] === null) return false;

    return this.dateArr[0].timestamp === day.timestamp && this.dateArr[1] !== null;
  }

  isEndSelection(day: ICalendarDay) {
    if (!day) return false;

    if (this.pickerMode !== 'range' || !this.initialised || this.dateArr[1] === null) return false;

    return this.dateArr[1].timestamp === day.timestamp;
  }

  isBetween(day: ICalendarDay): boolean {
    if (!day) return false;

    if (this.pickerMode !== 'range' || !this.initialised) return false;

    if (this.dateArr[0] === null || this.dateArr[1] === null) {
      return false;
    }

    const start = this.dateArr[0].timestamp;
    const end = this.dateArr[1].timestamp;

    return day.timestamp < end && day.timestamp > start;
  }

  onSelected(item: ICalendarDay) {
    item.selected = true;

    this.onDaySelect.emit(item);

    if (this.pickerMode === 'single') {
      this.dateArr[0] = item;

      this.onChange.emit(this.dateArr as any); // TODO: Fix type
      return;
    }

    if (this.pickerMode === 'range') {
      if (this.dateArr[0] === null) {
        this.dateArr[0] = item;

        this.onSelectStart.emit(item);
      } else if (this.dateArr[1] === null) {
        if (this.dateArr[0].timestamp < item.timestamp) {
          this.dateArr[1] = item;

          this.onSelectEnd.emit(item);
        } else {
          this.dateArr[1] = this.dateArr[0];

          this.onSelectEnd.emit(this.dateArr[0]);

          this.dateArr[0] = item;

          this.onSelectStart.emit(item);
        }
      } else if (this.dateArr[0].timestamp > item.timestamp) {
        this.dateArr[0] = item;

        this.onSelectStart.emit(item);

      } else if (this.dateArr[1].timestamp < item.timestamp) {
        this.dateArr[1] = item;

        this.onSelectEnd.emit(item);
        // this.selectEnd.emit(item);
      } else {
        this.dateArr[0] = item;
        this.dateArr[1] = null;

        this.onSelectStart.emit(item); // TODO: Fix type
      }

      this.onChange.emit(this.dateArr as any);
      return;
    }

    if (this.pickerMode === 'multi') {
      const index = this.dateArr.findIndex(e => e !== null && e.timestamp === item.timestamp);

      if (index === -1) {
        this.dateArr.push(item);
      } else {
        this.dateArr.splice(index, 1);
      }

      this.onChange.emit(this.dateArr.filter(e => e !== null) as any);
    }
  }

  isSelected(time: number) {
    if (!Array.isArray(this.dateArr)) return false;

    if (this.pickerMode !== 'multi') {
      if (this.dateArr[0] !== null) {
        return time === this.dateArr[0].timestamp;
      }

      if (this.dateArr[1] !== null) {
        return time === this.dateArr[1].timestamp;
      }
    } else {
      return this.dateArr.findIndex(e => e !== null && e.timestamp === time) !== -1;
    }

    return this.dateArr.findIndex(e => e !== null && e.timestamp === time) !== -1;
  }

  /** Used for aria-label */
  getDayLabel(day: ICalendarDay) {
    return new Date(day.timestamp);
  }
}

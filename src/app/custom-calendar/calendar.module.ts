import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarComponent } from './calendar/calendar.component';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';

@NgModule({
  declarations: [
    CalendarComponent,
    CalendarWeekComponent,
    MonthPickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CalendarComponent],
})

export class CalendarModule { }

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    CalendarWeekComponent,
    MonthPickerComponent,
    CalendarComponent,
    CalendarMonthComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    CalendarWeekComponent,
    MonthPickerComponent,
    CalendarComponent,
    CalendarMonthComponent
  ],
})
export class ComponentsModule { }

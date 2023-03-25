import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarComponent } from './calendar/calendar.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';

@NgModule({
  declarations: [
    CalendarComponent,
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

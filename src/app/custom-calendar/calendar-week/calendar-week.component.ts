import { Component } from '@angular/core';

@Component({
  selector: 'calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.scss'],
})
export class CalendarWeekComponent {

  days: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

}

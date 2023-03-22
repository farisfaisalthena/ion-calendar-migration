import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ion-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.scss'],
})
export class CalendarWeekComponent  implements OnInit {

  _weekArray: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  _displayWeekArray: string[] = this._weekArray;

  constructor() { }

  ngOnInit() {}

}

import { Component } from '@angular/core';

import { parseISO } from 'date-fns';

import { CalendarComponentOptions, DayConfig } from '../components/calendar/calendar.component';
import { ICalendarOptions } from '../custom-calendar/calendar-interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  datesConfig: DayConfig[] = [];
  options: CalendarComponentOptions = {
    daysConfig: this.datesConfig,
    showAdjacentMonthDay: false,
    weekStart: 1,
    pickMode: 'single'
  };

  opt: ICalendarOptions = {
    daysConfig: this.datesConfig
  }

  attendanceResponse = [
    {
      ATTENDANCE_STATUS: "Y",
      CLASS_DATE: "2023-03-03T00:00:00+08:00Z",
      CLASS_TYPE: "Lecture",
      TIME_FROM: "08:30 AM",
      TIME_TO: "10:30 AM"
    },
    {
      ATTENDANCE_STATUS: "A",
      CLASS_DATE: "2023-03-04T00:00:00+08:00Z",
      CLASS_TYPE: "Lab",
      TIME_FROM: "10:30 AM",
      TIME_TO: "12:30 PM"
    },
    {
      ATTENDANCE_STATUS: "A",
      CLASS_DATE: "2023-03-05T00:00:00+08:00Z",
      CLASS_TYPE: "Lecture",
      TIME_FROM: "08:30 AM",
      TIME_TO: "10:30 AM"
    },
    {
      ATTENDANCE_STATUS: "Y",
      CLASS_DATE: "2023-03-06T00:00:00+08:00Z",
      CLASS_TYPE: "Lecture",
      TIME_FROM: "08:30 AM",
      TIME_TO: "10:30 AM"
    },
    {
      ATTENDANCE_STATUS: "Y",
      CLASS_DATE: "2023-03-07T00:00:00+08:00Z",
      CLASS_TYPE: "Lecture",
      TIME_FROM: "08:30 AM",
      TIME_TO: "10:30 AM"
    },
    {
      ATTENDANCE_STATUS: "Y",
      CLASS_DATE: "2023-03-08T00:00:00+08:00Z",
      CLASS_TYPE: "Lecture",
      TIME_FROM: "08:30 AM",
      TIME_TO: "10:30 AM"
    },
    {
      ATTENDANCE_STATUS: "Y",
      CLASS_DATE: "2023-03-09T00:00:00+08:00Z",
      CLASS_TYPE: "Lecture",
      TIME_FROM: "08:30 AM",
      TIME_TO: "10:30 AM"
    },
    {
      ATTENDANCE_STATUS: "Y",
      CLASS_DATE: "2023-03-10T00:00:00+08:00Z",
      CLASS_TYPE: "Lecture",
      TIME_FROM: "08:30 AM",
      TIME_TO: "10:30 AM"
    }
  ];

  constructor() {
    for (const att of this.attendanceResponse) {
      let color = 'var(--ion-color-success)';

      if (att.ATTENDANCE_STATUS === 'A') {
        color = 'var(--ion-color-danger)';
      }

      this.datesConfig.push({
        date: this.formatDate(att.CLASS_DATE),
        marked: true,
        disable: false,
        subTitle: '',
        cssClass: ''
      });
    }
  }

  formatDate(date: string) {
    return new Date(new Date(parseISO(date)).getTime() + (new Date().getTimezoneOffset() * 60 * 1000));
  }
}

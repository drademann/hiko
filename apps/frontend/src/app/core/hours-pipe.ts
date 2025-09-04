import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hours',
  standalone: true,
})
export class HoursPipe implements PipeTransform {
  transform(seconds: number | undefined): string {
    if (seconds === undefined) {
      return '--:--';
    }
    const sign = seconds < 0 ? '-' : '';
    const s = Math.abs(seconds);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}

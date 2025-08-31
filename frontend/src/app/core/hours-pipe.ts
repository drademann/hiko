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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}

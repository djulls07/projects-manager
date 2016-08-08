import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filesize' })
export class Filesize implements PipeTransform {
	transform(value: number): number {
		value = value / 1000000;
		return Math.round(value*100) / 100;
	}
}
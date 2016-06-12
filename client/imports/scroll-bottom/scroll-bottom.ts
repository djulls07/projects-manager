import {Directive, ElementRef, Input, SimpleChange} from '@angular/core';

@Directive({
	selector: '[scrollBottom]'
})
export class ScrollBottom {
	@Input('scrollBottom') len: number;
	constructor(private el: ElementRef) {

	}

	scrollingBottom(e?) {
		this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
	}

	ngOnChanges(changes: Map<String, SimpleChange>) {
		setTimeout(() => {
			this.scrollingBottom();
		}, 100);
	}
}
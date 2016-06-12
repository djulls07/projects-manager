import 'reflect-metadata';
import { Component, Injectable } from '@angular/core';

@Component({
	selector: 'wysiwyg'
})
@Injectable()
export class Wysiwyg {
	constructor() {
	}

	run(selector: string) {
		tinymce.init({
			selector: selector
		});
	}

	getContent() {
		return tinymce.activeEditor.getContent();
	}

	setContent(content) {
		tinymce.activeEditor.setContent(content);
	}
}
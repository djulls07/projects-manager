import 'reflect-metadata';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router-deprecated';
import { InjectUser, LoginButtons } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';

@Component({
	selector: 'home',
	templateUrl: '/client/imports/home/home.html',
	directives: [RouterLink, LoginButtons]
})
@InjectUser('user')
export class Home extends MeteorComponent {
	user: any;
	constructor() {
		super();
		this.subscribe('files', () => {
			this.files = MyFiles.find();
		}, true)
	}
}
import 'reflect-metadata';
import { Component, Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
	selector: 'theme',
	templateUrl: '/client/imports/navbar/navbar.html',
	providers: [Cookie]
})
@Injectable()
export class Theme {
	user: any;
	themesList: any;
	themeDefault: string = 'flatly';
	constructor() {
		this.themesList = {
			simplex: 'https://bootswatch.com/simplex/bootstrap.min.css',
			sandstone: 'https://bootswatch.com/sandstone/bootstrap.min.css',
			cerulean: 'https://bootswatch.com/cerulean/bootstrap.min.css',
			cosmo: 'https://bootswatch.com/cosmo/bootstrap.min.css',
			cyborg: 'https://bootswatch.com/cyborg/bootstrap.min.css',
			darkly: 'https://bootswatch.com/darkly/bootstrap.min.css',
			flatly: 'https://bootswatch.com/flatly/bootstrap.min.css',
			journal: 'https://bootswatch.com/journal/bootstrap.min.css',
			lumen: 'https://bootswatch.com/lumen/bootstrap.min.css',
			paper: 'https://bootswatch.com/paper/bootstrap.min.css',
			readable: 'https://bootswatch.com/readable/bootstrap.min.css',
			slate: 'https://bootswatch.com/slate/bootstrap.min.css',
			spacelab: 'https://bootswatch.com/spacelab/bootstrap.min.css',
			superhero: 'https://bootswatch.com/superhero/bootstrap.min.css',
			united: 'https://bootswatch.com/united/bootstrap.min.css',
			yeti: 'https://bootswatch.com/yeti/bootstrap.min.css'
		};
	}
	// should be called ONLY once on startup ( by root component )
	init() {
		let url = Cookie.get('boostrap_theme_url');
		if (!url) {
			Cookie.set('boostrap_theme_name', this.themeDefault);
			Cookie.set('boostrap_theme_url', this.themesList[this.themeDefault]);
			url = this.themesList[this.themeDefault];
		}
		jQuery('<link id="custom_theme">')
			.appendTo('head')
			.attr({ type: 'text/css', rel: 'stylesheet' })
			.attr('href', url);
	}

	// use this method to setTheme & reload it immediatly
	setTheme(themeName) {
		let url = this.themesList[themeName];
		if (!url) {
			return;
		}
		Cookie.set('boostrap_theme_name', themeName);
		Cookie.set('boostrap_theme_url', this.themesList[themeName]);
		jQuery('#custom_theme')
			.attr('href', url);
	}

	// return theme list after transform it into array of { name: ObjKey }
	getThemeList() {
		let ret = [];
		for (let k in this.themesList) {
			ret.push({
				name: k
			});
		}
		return ret;
	}
	
	getActiveTheme() {
		return Cookie.get('boostrap_theme_name');
	}
}
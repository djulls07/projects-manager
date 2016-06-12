import 'reflect-metadata';
import { Component} from '@angular/core';
import { InjectUser, LoginButtons } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { RouterLink, Router } from '@angular/router-deprecated';
import { Theme } from '../theme/theme';

@Component({
	selector: 'navbar',
	templateUrl: '/client/imports/navbar/navbar.html',
	directives: [RouterLink, LoginButtons],
	providers: [Theme]
})
@InjectUser('user')
export class Navbar extends MeteorComponent {
	user: any;
	themes: any;

	constructor(private router: Router, private themeService: Theme) {
		super();
		this.themes = themeService.getThemeList();
	}
	isActive(route) {
		return this.router.isRouteActive(this.router.generate(route));
	}
	changeTheme(theme) {
		this.themeService.setTheme(theme.name);
	}

	getActiveTheme() {
		return this.themeService.getActiveTheme();
	}

}
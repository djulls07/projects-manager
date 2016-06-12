import 'reflect-metadata';
import { Component} from '@angular/core';
import { Location } from '@angular/common';
import { MeteorComponent } from 'angular2-meteor';
import { RouterLink, RouteParams } from '@angular/router-deprecated';
import { Projects } from '../../../collections/projects';

@Component({
	selector: 'project-nav',
	templateUrl: '/client/imports/project-nav/project-nav.html',
	directives: [RouterLink],
	providers: [Location]
})
export class ProjectNav extends MeteorComponent {
	user: any;
	project: Project;
	constructor(private params: RouteParams, private location: Location) {
		super();
		this.subscribe('project', params.get('projectId'),  () => {
			this.project = Projects.findOne(params.get('projectId'));
		}, true);
	}
	isActive(str: string) {
		return window.location.pathname.match(str);
	}
	back() {
		this.location.back();
	}
}
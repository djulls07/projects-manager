import 'reflect-metadata';
import { Component } from '@angular/core';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { ProjectForm } from '../project-form/project-form';
import { Projects} from '../../../collections/projects';
import { Mongo } from 'meteor/mongo';
import { RouterLink } from '@angular/router-deprecated';

@Component({
	selector: 'projects-list',
	templateUrl: '/client/imports/projects-list/projects-list.html',
	directives: [ProjectForm, RouterLink]
})
@RequireUser()
export class ProjectsList extends MeteorComponent {
	projects: Mongo.Cursor<Project>;

	constructor() {
		super();
		this.subscribe('projects', () => {
			this.projects = Projects.find({}, { sort: { createdAt: -1 } });
		}, true);
	}
}
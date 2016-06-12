import 'reflect-metadata';
import { Component} from '@angular/core';
import { MeteorComponent } from 'angular2-meteor';
import { ProjectNav } from '../project-nav/project-nav';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import { RouteParams, RouterLink } from '@angular/router-deprecated';
import { Meteor } from 'meteor/meteor';
import { Projects } from '../../../collections/projects';

@Component({
	selector: 'project-details',
	templateUrl: '/client/imports/project-details/project-details.html',
	directives: [ProjectNav, RouterLink]
})
export class ProjectDetails extends MeteorComponent {
	user: any;
	project: Project;
	items: Array<Item>;

	constructor(private params: RouteParams) {
		super();
		this.subscribe('project', params.get('projectId'), () => {
			this.autorun(() => {
				this.project = Projects.findOne(params.get('projectId'));
			}, true);
		});
		this.items = [
			new Item('User details', ['/ProjectUsersDetails', { projectId: params.get('projectId') }], 'Navigate to user details'),
			new Item('Project Groups', ['/GroupsList', { projectId: params.get('projectId') }], 'Navigate to project groups'),
			new Item('Task list', ['/TasksList', {projectId: params.get('projectId')}], 'Navigate to task list'),
			new Item('Task i am working on', ['/WorkingTasksList', { projectId: params.get('projectId') }], 'Navigate to the list of task i am working on'),
			new Item('Task i own', ['/MyTasksList', { projectId: params.get('projectId') }], 'Navigate to the list of tasks i have created'),
			new Item('Add task', ['/TaskForm', { projectId: params.get('projectId') }], 'Navigate to task form to create new task')
		];
	}
}

class Item {
	constructor(
		private name: string,
		private link: any,
		private linkName: string
	) {}
}
import 'reflect-metadata';
import { Component} from '@angular/core';
import { MeteorComponent } from 'angular2-meteor';
import { ProjectNav } from '../project-nav/project-nav';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import { RouteParams } from '@angular/router-deprecated';
import { Meteor } from 'meteor/meteor';
import { Projects } from '../../../collections/projects';
import { Modal } from '../modal/modal';

@Component({
	selector: 'project-users-details',
	templateUrl: '/client/imports/project-users-details/project-users-details.html',
	directives: [ProjectNav],
	providers: [Modal]
})
export class ProjectUsersDetails extends MeteorComponent {
	user: any;
	userForm: ControlGroup;
	project: Project;
	detailsUser: any;
	includeSubTasks: boolean = false;

	constructor(private params: RouteParams, private modal: Modal) {
		super();
		this.subscribe('project', params.get('projectId'), () => {
			this.autorun(() => {
				this.project = Projects.findOne(params.get('projectId'));
			}, true);
		});
		let fb = new FormBuilder();
		this.userForm = fb.group({
			email: ['', Validators.required]
		});
	}
	changeShowSub() {
		this.includeSubTasks = !this.includeSubTasks;
		this.queryDetailsUser();
	}
	queryDetailsUser() {
		Meteor.call('projectDetailsByUser', this.params.get('projectId'), this.includeSubTasks, (err, data) => {
			if (data) {
				this.autorun(() => {
					this.detailsUser = data;
				}, true);
			}
		});
	}

	ngOnInit() {
		this.queryDetailsUser();
	}

	addUser(user) {
		Meteor.call('addUserProject', this.params.get('projectId'), user.email, (err, data) => {
			if (err) {
				this.modal.alert(err.reason);
			}
			if (data) {
				if (data.hasCreateUser) {
					this.modal.alert('User has been added to project, and his account created. His credentials has been sent to your e-mail.');
				} else {
					this.modal.alert('User has been added to project.');
				}
			}
			this.queryDetailsUser();
		});
		(<Control>this.userForm.controls['email']).updateValue('');
	}

}
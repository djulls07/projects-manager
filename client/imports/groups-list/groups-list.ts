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
	selector: 'groups-list',
	templateUrl: '/client/imports/groups-list/groups-list.html',
	directives: [ProjectNav],
	providers: [Modal]
})
export class GroupsList extends MeteorComponent {
	user: any;
	groupForm: ControlGroup;
	project: Project;

	constructor(private params: RouteParams, private modal: Modal) {
		super();
		this.subscribe('project', params.get('projectId'), () => {
			this.autorun(() => {
				this.project = Projects.findOne(params.get('projectId'));
			}, true);
		});
		let fb = new FormBuilder();
		this.groupForm = fb.group({
			name: ['', Validators.required]
		});
	}

	addGroup(group) {
		if (this.groupForm.valid) {
			Meteor.call('addGroupProject', this.project._id, group.name, (err) => {
				if (err) {
					this.modal.alert('Only project owner can manage groups');
				}
			});
			(<Control>this.groupForm.controls['name']).updateValue('');
		}
	}

	addRemoveUserToGroup(group: ProjectGroup, userTarget: ProjectUser) {
		Meteor.call('addRemoveUserToGroupProject', this.project._id, group.name, userTarget, (err) => {
			if (err) {
				this.modal.alert('Only project owner can manage groups');
			}
		});
	}

	isInProjectGroup(group: ProjectGroup, user: ProjectUser) {
		for (let i = 0; i < group.users.length; i++) {
			if (group.users[i].userId === user.userId) {
				return true;
			}
		}
		return false;
	}

	removeGroup(group: ProjectGroup) {
		Meteor.call('removeGroupProject', this.project._id, group.name);
	}
}
import 'reflect-metadata';
import { Component } from '@angular/core';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { Meteor } from 'meteor/meteor';

@Component({
	selector: 'project-form',
	templateUrl: '/client/imports/project-form/project-form.html'
})
@RequireUser()
export class ProjectForm {

	projectForm: ControlGroup;

	constructor() {
		let fb = new FormBuilder();
		this.projectForm = fb.group({
			name: ['', Validators.required]
		});
	}

	addProject(project) {
		
		if (this.projectForm.valid) {
			Meteor.call('addProject', project.name);
			(<Control>this.projectForm.controls['name']).updateValue('');
		}
	}
}
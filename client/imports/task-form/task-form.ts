import 'reflect-metadata';
import { Component, Input } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import { RouteParams, Router } from '@angular/router-deprecated';
import { Projects } from '../../../collections/projects';
import { ProjectNav } from '../project-nav/project-nav';
import { Modal } from '../modal/modal';
import { Wysiwyg } from '../wysiwyg/wysiwyg';
import { Uploader } from '../uploader/uploader';

@Component({
	selector: 'task-form',
	templateUrl: '/client/imports/task-form/task-form.html',
	directives: [ProjectNav, Uploader],
	providers: [Modal, Wysiwyg]
})
@RequireUser()
export class TaskForm extends MeteorComponent {
	@Input('parentTask') parentTask: Task;
	@Input('callback') callback: any;
	taskForm: ControlGroup;
	project: Project;
	selected: Object = {};
	selectedGroups: Object = {};
	self: any;
	tmpFiles: Array<any> = [];
	tabsTargets: string = 'users';
	notifyTargets: boolean = false;
	parentTaskId: string = null;

	constructor (
		private params: RouteParams,
		private router: Router, 
		private modal: Modal,
		private wysiwyg: Wysiwyg
	){
		super();
		this.subscribe('project', params.get('projectId'), () => {
			this.project = Projects.findOne({ _id: params.get('projectId') });
		}, true);

		let fb = new FormBuilder();
		this.taskForm = fb.group({
			name: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
			priority: ['low', Validators.required],
			targets: [[], Validators.required],
			dueDate: ['', Validators.minLength(10)],
			description: ['']
		});
	}

	ngOnInit() {
		if (this.parentTask) {
			this.parentTaskId = this.parentTask._id;
		}
		this.wysiwyg.run('textarea');
	}

	addTask(task) {
		let usersSelected = [];
		this.project.groups.forEach((group) => {
			if (this.selectedGroups[group.name] === true) {
				group.users.forEach((u) => {
					if (!this.selected[u.userId]) {
						this.selected[u.userId] = true;
					}
				});
			}
		});
		this.project.users.forEach((user) => {
			if (this.selected[user.userId] === true) {
				usersSelected.push(user);
			}
		});
		task.targets = usersSelected;
		task.description = this.wysiwyg.getContent();
		if (this.taskForm.valid && task.description.length) {
			if (task.dueDate.length) {
				task.dueDate = new Date(task.dueDate);
			} else {
				task.dueDate = new Date();
			}
			task.project = this.params.get('projectId');
			task.files = this.tmpFiles.map((f) => f._id);
			Meteor.call('addTask', task, this.notifyTargets, this.parentTaskId, (err, taskId) => {
				if (err) {
					this.modal.alert(err.reason);
					this.tmpFiles = [];
				}
				if (taskId) {
					this.modal.alert('Your task has been saved & form has been reset to add more if you want.');
					// reset form ( in case we dont navigate anymore )
					(<Control>this.taskForm.controls['name']).updateValue('');
					(<Control>this.taskForm.controls['priority']).updateValue('low');
					(<Control>this.taskForm.controls['targets']).updateValue([]);
					(<Control>this.taskForm.controls['dueDate']).updateValue('');
					(<Control>this.taskForm.controls['description']).updateValue('');
					this.wysiwyg.setContent('');
					this.selected = {};
					this.selectedGroups = {};
					this.tmpFiles = [];
					if (this.callback && this.callback.length === 3) {
						this.callback[0].call(this.callback[1], this.callback[2]);
					}
				}
			});	
		}
	}
	uploadCallback(result) {
		console.log('res callback', result);
		this.tmpFiles.push(result);
	}
	
}
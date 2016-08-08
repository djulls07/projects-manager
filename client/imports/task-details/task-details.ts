import 'reflect-metadata';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { Mongo } from 'meteor/mongo';
import { Tasks } from '../../../collections/tasks';
import { MyFiles } from '../../../collections/my-files';
import { RouteParams, RouterLink,  } from '@angular/router-deprecated';
import { ProjectNav } from '../project-nav/project-nav';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import { Modal} from '../modal/modal';
import { TaskForm } from '../task-form/task-form';
import { ScrollBottom } from '../scroll-bottom/scroll-bottom';
import { Projects } from '../../../collections/projects';

@Component({
	selector: 'task-details',
	templateUrl: '/client/imports/task-details/task-details.html',
	directives: [ProjectNav, RouterLink, TaskForm, ScrollBottom],
	providers: [Modal]
})
@RequireUser()
export class TaskDetails extends MeteorComponent {
	task: Task;
	messageForm: ControlGroup;
	subTasks: Mongo.Cursor<Task>;
	addSubTask: boolean = false;
	self: any;
	files: Mongo.Cursor<MyFile>;
	project: Project;

	constructor(params: RouteParams, private modal: Modal, private location: Location) {
		super();
		this.self = this;
		this.subscribe('taskAndSubTasks', params.get('taskId'), () => {
			this.autorun(() => {
				this.task = Tasks.findOne({ _id: params.get('taskId') });
				this.subTasks = Tasks.find({ parentTask: params.get('taskId') });
			}, true);
		});

		let fb = new FormBuilder();
		this.messageForm = fb.group({
			message: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(1024)])]
		});

		this.subscribe('taskFiles', params.get('taskId'), () => {
			this.files = MyFiles.find({});
			console.log('files', this.files.count());
		}, true);

		this.subscribe('project', params.get('projectId'), () => {
			this.project = Projects.findOne(params.get('projectId'));
		}, true);
	}

	addMessage(message) {
		Meteor.call('addMessageTask', this.task._id, message.message);
		(<Control>this.messageForm.controls['message']).updateValue('');
	}

	validTask() {
		Meteor.call('validTask', this.task._id);
	}
	completeTask() {
		Meteor.call('completeTask', this.task._id);
	}
	confirmArchiveTask() {
		this.modal.confirm('Archived tasks won\'t be displayed in task list, confirm archive task ?' , this.archiveTask, null, this);
	}
	archiveTask() {
		Meteor.call('archiveTask', this.task._id);
	}
	// owner the task or project
	isOwner() {
		let userId = Meteor.userId();
		return (userId === this.task.owner || this.project.owner === userId);
	}
	hideFormSubTask(args?: Array<any>) {
		this.addSubTask = false;
	}

	back() {
		this.location.back();
	}
}
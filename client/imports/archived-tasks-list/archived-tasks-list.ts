import 'reflect-metadata';
import { Component } from '@angular/core';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { Tasks} from '../../../collections/tasks';
import { Mongo } from 'meteor/mongo';
import { RouterLink, RouteParams } from '@angular/router-deprecated';
import { ProjectNav } from '../project-nav/project-nav';
import { InjectUser } from 'angular2-meteor-accounts-ui';

@Component({
	selector: 'archived-tasks-list',
	templateUrl: '/client/imports/archived-tasks-list/archived-tasks-list.html',
	directives: [RouterLink, ProjectNav]
})
@RequireUser()
@InjectUser('user')
export class ArchivedTasksList extends MeteorComponent {
	tasks: Mongo.Cursor<Task>;
	user: any;
	showSub: ReactiveVar<boolean> = new ReactiveVar<boolean>(false);
	search: ReactiveVar<string> = new ReactiveVar<string>('');
	searchModel: string = '';
	showSubModel: boolean = false;

	constructor(private params: RouteParams) {
		super();
		this.subscribe('tasksArchived', params.get('projectId'), this.showSub.get(), this.search.get(), () => {
			this.tasks = Tasks.find({}, { sort: { dueDate: -1 } });
		}, true);
	}

	removeTask(taskId: string) {
		Meteor.call('removeTask', taskId);
	}
	isOwner(task: Task) {
		return this.user._id === task.owner;
	}
	changeShowSub() {
		this.showSubModel = !this.showSubModel;
		this.showSub.set(this.showSubModel);
	}

	triggerSearch() {
		this.search.set(this.searchModel);
	}
}
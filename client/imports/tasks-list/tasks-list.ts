import 'reflect-metadata';
import { Component } from '@angular/core';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { Tasks} from '../../../collections/tasks';
import { Mongo } from 'meteor/mongo';
import { RouterLink, RouteParams } from '@angular/router-deprecated';
import { ProjectNav } from '../project-nav/project-nav';

@Component({
	selector: 'tasks-list',
	templateUrl: '/client/imports/tasks-list/tasks-list.html',
	directives: [RouterLink, ProjectNav]
})
@RequireUser()
export class TasksList extends MeteorComponent {
	tasks: Mongo.Cursor<Task>;
	showSub: ReactiveVar<boolean> = new ReactiveVar<boolean>(false);
	search: ReactiveVar<string> = new ReactiveVar<string>('');
	searchModel: string = '';
	showSubModel: boolean = false;

	constructor(private params: RouteParams) {
		super();
		this.autorun(() => {
			this.subscribe('tasks', params.get('projectId'), this.showSub.get(), this.search.get(), () => {
				this.tasks = Tasks.find({}, { sort: { dueDate: -1 } });
			}, true);
		});
	}
	changeShowSub() {
		this.showSubModel = !this.showSubModel;
		this.showSub.set(this.showSubModel);
	}

	triggerSearch() {
		this.search.set(this.searchModel);
	}
}
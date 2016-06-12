import 'reflect-metadata';
import { Component } from '@angular/core';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { Tasks} from '../../../collections/tasks';
import { Mongo } from 'meteor/mongo';
import { RouterLink, RouteParams } from '@angular/router-deprecated';
import { ProjectNav } from '../project-nav/project-nav';

@Component({
	selector: 'working-tasks-list',
	templateUrl: '/client/imports/working-tasks-list/working-tasks-list.html',
	directives: [RouterLink, ProjectNav]
})
@RequireUser()
export class WorkingTasksList extends MeteorComponent {
	tasks: Mongo.Cursor<Task>;
	showSub: ReactiveVar<boolean> = new ReactiveVar<boolean>(false);
	showSubModel: boolean = false;
	search: ReactiveVar<string> = new ReactiveVar<string>('');
	searchModel: string = '';
	
	constructor(private params: RouteParams) {
		super();
		this.autorun(() => {
			this.subscribe('tasksWorkingOn', params.get('projectId'), this.showSub.get(), this.search.get(), () => {
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
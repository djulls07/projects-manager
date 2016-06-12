import { Tasks } from '../collections/tasks';
import { Meteor } from 'meteor/meteor';
import { Projects } from '../collections/projects';

function buildSearchRequest(q: any, search: string) {
	if (!search.length) return q;
	q['$or'] = [
		{ name: new RegExp('.*'+search+'.*', 'gi') },
		{ ownerEmail: new RegExp('.*' + search + '.*', 'gi') },
		{ priority: new RegExp('.*' + search + '.*', 'gi') }
	];
	return q;
}

Meteor.publish('tasks', function(projectId: string, querySubTasks: boolean, search: string) {
	let q = {
		project: projectId,
		archived: false
	}
	if (!querySubTasks) {
		q['isSubTask'] = false;
	}
	if (search) {
		buildSearchRequest(q, search);
	}
	return Tasks.find(q);
});
Meteor.publish('tasksArchived', function(projectId: string, querySubTasks: boolean, search: string) {
	let q = {
		project: projectId,
		archived: true
	};

	if (!querySubTasks) {
		q['isSubTask'] = false;
	}
	if (search) {
		q = buildSearchRequest(q, search);
	}
	return Tasks.find(q);
});
Meteor.publish('tasksIOwn', function(projectId: string, querySubTasks: boolean, search: string) {
	let q = {
		project: projectId,
		owner: this.userId,
		archived: false
	}
	if (!querySubTasks) {
		q['isSubTask'] = false;
	}
	if (search) {
		q = buildSearchRequest(q, search);
	}
	return Tasks.find(q);
});
Meteor.publish('tasksWorkingOn', function(projectId: string, querySubTasks: boolean, search: string) {
	let q = {
		project: projectId,
		'targets.userId': this.userId,
		archived: false,
		validated: false
	};
	if (!querySubTasks) {
		q['isSubTask'] = false;
	}
	if (search) {
		q = buildSearchRequest(q, search);
	}
	return Tasks.find(q);
});

Meteor.publish('task', function(taskId: string) {
	let task = Tasks.findOne(taskId);
	let project = Projects.findOne(task.project);
	let auth = false;
	let q = {};
	q['_id'] = taskId;
	for (let i = 0; i < project.users.length; i++) {
		if (project.users[i].userId === this.userId) {
			auth = true;
			break;
		}
	}
	if (!auth) {
		q['$or'] = [
			{ owner: this.userId },
			{ 'targets.userId': this.userId }
		];
	}
	return Tasks.find(q);
});

Meteor.publish('taskAndSubTasks', function(taskId: string) {
	return Tasks.find({
		$or: [
			{
				_id: taskId,
				$or: [
					{ owner: this.userId },
					{ 'targets.userId': this.userId }
				]
			},
			{
				parentTask: taskId,
				$or: [
					{ owner: this.userId },
					{ 'targets.userId': this.userId }
				]
			}
		]
	});
});

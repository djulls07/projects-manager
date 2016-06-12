import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Projects } from '../collections/projects';
import { Email } from 'meteor/email';
import { MyFiles } from '../collections/my-files';
import { linkFilesModel } from './my-files';

export let Tasks = new Mongo.Collection<Task>('tasks');

Tasks.allow({
	insert: function(docId, doc: Task) {
		let access = false;
		let user = Meteor.user();
		let project = Projects.findOne({ _id: doc.project });
		project.users.forEach((up) => {
			if (up.userId === user._id) {
				access = true;
			}
		});
		return !!user && access;
	}
});

Meteor.methods({
	addTask: function(task: Task, notifyTargets: boolean, parentTaskId?: string) {
		check(task.project, String);
		check(task.name, String);
		check(task.priority, String);
		check(task.dueDate, Date);
		check(task.description, String);
		check(notifyTargets, Boolean);

		let parentTask = null;
		let project = Projects.findOne(task.project);
		let isSubTask = false;
		if (!project) {
			throw new Meteor.Error('404', 'project-not-found');
		}

		if (parentTaskId) {
			parentTask = Tasks.findOne(parentTaskId);
			if (!parentTask) {
				throw new Meteor.Error('404', 'parent-task-not-found');
			}
			isSubTask = true;
		}
		if (!task.targets || task.targets.length === 0) {
			throw new Meteor.Error('400', 'Please select at least one target');
		}
		// verif et retrait des doublons targets
		let targets = [];
		let ids = {};
		task.targets.forEach((target) => {
			if (ids[target.userId] === true) return;
			targets.push(target);
			ids[target.userId] = true;
		});
		task.targets = targets;

		let user = Meteor.user();
		task.owner = user._id;
		task.ownerEmail = user.emails[0].address;
		task.createdAt = new Date();
		task.validated = false;
		task.archived = false;
		task.completed = false;
		task.conversation = [];
		task.isSubTask = isSubTask;
		task.hasSubTasks = false;
		task.subTasks = [];
		task.parentTask = parentTaskId || null;

		let taskId = Tasks.insert(task);
		
		let linking = linkFilesModel(project._id, 'task', taskId, task.files);
		if (!linking) {
			Tasks.remove(taskId);
			throw new Meteor.Error('403', 'No more space for files');
		}		
		// update parent task if needed
		if (parentTaskId) {
			Tasks.update(parentTaskId, {
				$push: {
					subTasks: taskId
				},
				$set: {
					hasSubTasks: true
				}
			});
		}
		// si server et param notify == true:
		this.unblock();
		if (Meteor.isServer && notifyTargets) {
			
			// send email to targets
			task.targets.forEach((target) => {
				let to = target.email;
				Email.send({
					to: to,
					from: process.env.MAIL_FROM,
					subject: 'You have a new task',
					text: 'New task ['+task.name+'] on project: '+project.name+', added by ' + task.ownerEmail
				});
			});
		}
		console.log('Task saved: ', taskId);
		return taskId;
	},
	addMessageTask: function (taskId: string, message: string) {
		check(taskId, String);
		check(message, String);
		if (!message.length || message.length < 3) {
			throw new Meteor.Error('400', 'message-to-short');
		}
		if (message.length > 1024) {
			throw new Meteor.Error('400', 'message-to-long');
		}
		// verif user & task
		let user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		let task = Tasks.find({
			_id: taskId,
			$or: [
				{ owner: this.userId },
				{ 'targets.userId': this.userId }
			]
		});
		if (!task) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		Tasks.update(taskId, {
			$push: {
				conversation: {
					message: message,
					createdAt: new Date(),
					owner: user._id,
					ownerEmail: user.emails[0].address
				}
			}
		});
	},
	validTask(taskId: string, compt?: number) {
		check(taskId, String);
		let user = Meteor.user();
		let task = Tasks.findOne(taskId);
		let c = compt || 0;
		if (!user || !task || task.owner !== user._id) {
			throw new Meteor.Error('not-authorized');
		}
		Tasks.update(taskId, {
			$set: {
				validated: true,
				completed: true,
				completor: user._id,
				validator: user._id
			}
		});
		if (task.hasSubTasks) {
			// on update et valide/complete les sub tasks (qui ne le sont pas uniquement).
			Tasks.update(
				{
					parentTask: task._id,
					validated: false,
					completed: false
				},
				{
					$set: {
						validated: true,
						completed: true,
						completor: user._id,
						validator: user._id
					}
				},
				{
					multi: true
				}
			);
			if (c >= 100) {
				throw new Meteor.Error('500', 'too-many-rec');
			} 

			task.subTasks.forEach((subTaskId) => {
				Meteor.call('validTask', subTaskId);
			});
		}
	},
	completeTask(taskId: string, compt?: number) {
		check(taskId, String);
		let user = Meteor.user();
		let task = Tasks.findOne(taskId);
		let auth = false;
		let c = compt || 0;
		if (!user || !task) {
			throw new Meteor.Error('not-authorized');
		}
		task.targets.forEach((target) => {
			if (target.userId === user._id) {
				auth = true;
			}
		});
		if (task.owner === user._id) {
			auth = true;
		}
		if (!auth) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, {
			$set: {
				completed: true,
				completor: user._id
			}
		});
		if (task.hasSubTasks) {
			// on update et complete les sub tasks (qui ne le sont pas uniquement).
			Tasks.update(
				{
					parentTask: task._id,
					completed: false
				},
				{
					$set: {
						completed: true,
						completor: user._id,
					}
				},
				{
					multi: true
				}
			);
			if (c >= 100) {
				throw new Meteor.Error('500', 'too-many-rec');
			} 

			task.subTasks.forEach((subTaskId) => {
				Meteor.call('completeTask', subTaskId);
			});
		}
	},
	archiveTask: function (taskId: string, compt?: number) {
		check(taskId, String);
		let c = compt || 0;
		let user = Meteor.user();
		let task = Tasks.findOne(taskId);
		let auth = false;
		if (!user || !task) {
			throw new Meteor.Error('not-authorized');
		}
		if (task.owner === user._id) {
			auth = true;
		}
		if (!auth) {
			throw new Meteor.Error('not-authorized');
		}
		Tasks.update(taskId, {
			$set: {
				archived: true,
				archivor: user._id
			}
		});
		if (task.hasSubTasks) {
			// on update et complete les sub tasks (qui ne le sont pas uniquement).
			Tasks.update(
				{
					parentTask: task._id,
					archived: false,
				},
				{
					$set: {
						archivor: user._id,
						archived: true
					}
				},
				{
					multi: true
				}
			);
			if (c >= 100) {
				throw new Meteor.Error('500', 'too-many-rec');
			} 
			task.subTasks.forEach((subTaskId) => {
				Meteor.call('archiveTask', subTaskId, c+1);
			});
		}
	},
	removeTask: function (taskId: string) {
		let user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		let task = Tasks.findOne(taskId);
		if (!task) {
			throw new Meteor.Error('404', 'not-found');
		}
		if (task.owner !== user._id) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		if (task.hasSubTasks || task.isSubTask) {
			throw new Meteor.Error('400', 'task-with-sub-tasks-or-parent');
		}
		MyFiles.remove({ modelName: 'task', modelId: taskId });
		// on spécifie aussi le owner dans le remove
		Tasks.remove({ _id: taskId, owner: user._id });
	}
});
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tasks } from './tasks';
import { Email } from 'meteor/email';
import { Random } from 'meteor/random';

export let Projects = new Mongo.Collection<Project>('projects');

Projects.allow({
	insert: function (docId, doc: Project) {
		let user = Meteor.user();
		return !!user;
	}
});

Meteor.methods({
	addProject: function (name: string) {
		check(name, String);

		let user = Meteor.user();
		if (!user || user.emails[0].address !== 'djulls07@gmail.com') {
			throw new Meteor.Error('not-authorized');
		}

		let project = {
			name: name,
			owner: user._id,
			ownerEmail: user.emails[0].address,
			createdAt: new Date(),
			users: [{ userId: user._id, email: user.emails[0].address }],
			groups: []
		}
		
		let id = Projects.insert(project);
		console.log('project saved: ', id);
	},
	addUserProject: function(projectId: string, userEmail: string) {
		let hasCreateUser = false;
		if (Meteor.isServer) {
			check(userEmail, String);
			check(projectId, String);

			let project = Projects.findOne(projectId);
			let user = Meteor.user();
			
			let pass = Random.id(8);

			if (!user || !project) {
				throw new Meteor.Error('403', 'not-authorized');
			}
			if (user._id !== project.owner) {
				throw new Meteor.Error('403', 'not-authorized');
			}

			let userAdd = Meteor.users.findOne({ 'emails.0.address': userEmail });
			if (!userAdd) {
				let userId = Accounts.createUser({ email: userEmail, password: pass });
				userAdd = Meteor.users.findOne(userId);
				if (!userAdd) {
					throw new Meteor.Error('404', 'user-not-found');
				}
				hasCreateUser = true;
			}
			let isIn = false;
			project.users.forEach((userP) => {
				if (userP.userId === userAdd._id) {
					isIn = true;
				}
			});
			if (!isIn) {
				Projects.update(projectId, {
					$push: {
						users: {
							email: userEmail,
							userId: userAdd._id
						}
					}
				});
			}
			this.unblock();
			if (Meteor.isServer && hasCreateUser) {
				// send email with password of account created.
				// send the pass to the creator email ( not the invited user ( avoid spam ))
				let to = user.emails[0].address
				Email.send({
					to: to,
					from: process.env.MAIL_FROM,
					subject: 'New user account created & invited',
					text: 	
						'You have invited a new user: "'+userEmail+'", his account has been created for you.\n'+
						'Please give the your new collaborator his credentials: \n\n'+
						'Login: ' + userEmail+'\n'+
						'Password: ' + pass
				});
			}
		}
		return { hasCreateUser: hasCreateUser };
	},
	/* Method that compute data ( by & about user of project( tasks created completed etc etc.) )*/
	projectDetailsByUser: function(projectId, includeSubTasks: boolean) {
		let ret = {
			users: {
				/* id => obj*/
			}
		};
		let retArr = [];
		if (Meteor.isServer) {
			let user = Meteor.user();
			let project = Projects.findOne(projectId);
			let isAuth = false;
			if (!user) {
				throw new Meteor.Error('403', 'not-authorized');
			}
			if (!project) {
				throw new Meteor.Error('404', 'not-found');
			}
			project.users.forEach((u) => {
				if (u.userId === user._id) {
					isAuth = true;
				}
			});
			if(isAuth) {
				// init for each user in project
				project.users.forEach((u) => {
					ret[u.userId] = {
						email: u.email,
						tasks: {
							active: {
								total: 0,
								validated: 0,
								completed: 0,
							},
							archived: 0,
							working: 0,
							hasWorked: 0,
							archivor: 0,
							completor: 0,
							validator: 0
						}
					};
				});
				let q = { project: projectId };
				if (includeSubTasks === false) {
					q['isSubTask'] = false;
				}
				let tasks = Tasks.find(q);
				tasks.forEach((task) => {
					// check task owner 
					if (task.archived) {
						ret[task.owner].tasks.archived++;
					} else {
						if (task.validated) {
							ret[task.owner].tasks.active.validated++;
						}
						if (task.completed) {
							ret[task.owner].tasks.active.completed++;
						}
						ret[task.owner].tasks.active.total++;
					}
					// check targets
					task.targets.forEach((target) => {
						if (task.archived || task.validated) {
							ret[target.userId].tasks.hasWorked++;
						} else {
							ret[target.userId].tasks.working++;
						}
						if (target.userId === task.completor) {
							ret[target.userId].tasks.completor++;
						}
						if (target.userId === task.archivor) {
							ret[target.userId].tasks.archivor++;
						}
						if (target.userId === task.validator) {
							ret[target.userId].tasks.validator++;
						}
					});
				});
			}
		}

		for (let k in ret) {
			if (!ret[k].email) continue;
			retArr.push(ret[k]);
		}
		return retArr;
	},
	addGroupProject(projectId: string, groupName: string) {
		check(groupName, String);
		check(projectId, String);

		let user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		let project = Projects.findOne({ owner: user._id, _id: projectId });
		if (!project) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		if (!project.groups) {
			project.groups = [];
		}
		// check if exists
		let exists = false;
		project.groups.forEach((group) => {
			if (group.name === groupName) {
				exists = true;
			}
		});
		if (exists) {
			throw new Meteor.Error('400', 'group-already-exists');
		}
		project.groups.push({
			name: groupName,
			users: []
		});
		Projects.update(projectId, {
			$set: {
				groups: project.groups
			}
		});
	},
	addRemoveUserToGroupProject(projectId: string, groupName: string, userTarget: ProjectUser) {
		check(groupName, String);
		check(projectId, String);
		check(userTarget.userId, String);

		let user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		// on selectionne le project avec onwer => Meteor.userId(),
		// _id => projectId et users.userId => userId
		// si on trouve le projet cest que le user co est owner et que le user cible est dans le projet.
		let project = Projects.findOne({ owner: user._id, _id: projectId, 'users.userId': userTarget.userId });
		if (!project) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		// check if exists
		let index = -1;
		project.groups.forEach((group, i) => {
			if (group.name === groupName) {
				index = i;
			}
		});
		if (index === -1) {
			throw new Meteor.Error('404', 'group-not-found');
		}
		let group = project.groups[index];
		let isInIndex = -1;
		group.users.forEach((u, i) => {
			if (u.userId === userTarget.userId) {
				isInIndex = i;
			}
		});
		if (isInIndex !== -1) {
			// retirer user
			group.users.splice(isInIndex, 1);
		} else {
			// ajouter user
			group.users.push(userTarget);
		}
		let set = {};
		set['groups.' + index] = group;
		Projects.update(projectId, {
			$set: set
		});
	},
	removeGroupProject(projectId, groupName) {
		check(groupName, String);
		check(projectId, String);

		let user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		let project = Projects.findOne({ owner: user._id, _id: projectId });
		if (!project) {
			throw new Meteor.Error('403', 'not-authorized');
		}
		if (!project.groups) {
			project.groups = [];
		}
		// check if exists
		let existsIndex = -1;
		project.groups.forEach((group, i) => {
			if (group.name === groupName) {
				existsIndex = i;
			}
		});
		if (existsIndex === -1) {
			throw new Meteor.Error('404', 'group-not-found');
		}
		project.groups.splice(existsIndex, 1);
		Projects.update(projectId, {
			$set: {
				groups: project.groups
			}
		});
	}
});
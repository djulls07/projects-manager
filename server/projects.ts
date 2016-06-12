import { Projects } from '../collections/projects';
import { Meteor } from 'meteor/meteor';

Meteor.publish('projects', function () {
	return Projects.find({
		'users.userId': this.userId
	});
});
Meteor.publish('project', function(projectId: string) {
	return Projects.find({ 
		_id: projectId,
		$or: [
			{ owner: this.userId },
			{ 'users.userId': this.userId }
		]
	});
});
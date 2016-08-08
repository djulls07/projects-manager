import { MyFiles } from '../collections/my-files';

Meteor.publish('taskFiles', function(taskId) {
	return MyFiles.find({modelName: 'task', modelId: taskId});
});

Meteor.publish('projectFiles', function(projectId: string) {
	return MyFiles.find({ projectId: projectId });
});
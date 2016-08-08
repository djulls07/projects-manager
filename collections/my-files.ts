import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { UploadFS } from 'meteor/jalik:ufs';

export const MyFiles = new Mongo.Collection<MyFile>('my-files');

function loggedIn(userId) {
	return !!userId;
}

MyFiles.allow({
	insert: loggedIn,
	update: loggedIn,
	remove: loggedIn
});

export const MyFilesStore = new UploadFS.store.GridFS({
	collection: MyFiles,
	name: 'my-files',
	filter: new UploadFS.Filter({
		contentTypes: ['image/*']
	})/*,
	copyTo: [
		ThumbsStore
	]*/
});

export function upload(sourceFile: File, resolve?: Function, reject?: Function) {
	// pick from an object only: name, type and size
	const file = {
		name: sourceFile.name,
		type: sourceFile.type,
		size: sourceFile.size,
		userId: Meteor.userId(),
		userEmail: Meteor.user().emails[0].address
	}
	const reader = new FileReader();

	// handle progress
	reader.onload = (ev: ProgressEvent) => {
		if (ev.type === 'load') {
			const upload = new UploadFS.Uploader({
				data: ev.target.result,
				file,
				store: MyFilesStore,
				onError: reject,
				onComplete: resolve
			});

			upload.start();
		} else if (ev.type === 'error') {
			throw new Error(`Couldn't load file`);
		}
	};
	// as ArrayBuffer
	reader.readAsArrayBuffer(sourceFile);
}

Meteor.methods({
	destroyComponentUpload: function() {
		// On retire tous les fichiers non link a au moins 1 projet et appartenant au user co.
		// finalement on ne regarde meme pas filesIds
		/*let f = MyFiles.find({ userId: Meteor.userId(), projectId: { $exists: false } });
		console.log('Files will be removed (destroyed component):', f.count());*/
		MyFiles.remove({ userId: Meteor.userId(), projectId: {$exists: false} });
	},
	linkFilesModel: linkFilesModel
})

export function linkFilesModel(projectId: string, modelName: string, modelId: string, filesIds: Array<string>) {

	let ret = true;
	// check if has right to upload more files for the projectId
	let files = MyFiles.find({ $or: [{ projectId: projectId }, { _id: { $in: filesIds } }] });
	let size = 0;
	files.forEach((file) => {
		size += file.size;
	});
	if (size > process.env.FILES_SIZE_PROJECT) {
		console.log('No space anymore', size + ' > ' + process.env.FILES_SIZE_PROJECT);
		ret = false; // not linking files will result in their removing
	}
	if (ret) {
		console.log('files ids', filesIds);
		MyFiles.update(
		{
			_id: { $in: filesIds }
		},
		{
			$set: {
				modelName: modelName,
				modelId: modelId,
				projectId: projectId
			}
		},
		{
			multi: true
		}
		);
	}
	return ret;
}
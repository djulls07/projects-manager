import './projects';
import './tasks';
import './my-files';

Meteor.startup(function() {
	if (!process.env.MONGO_URL) {
		//throw new Meteor.Error('404', 'Var env missing: FILE_SIZE_PROJECT');
		console.log('MONGO_URL is not set, if you are in production mode, this will be a pb. Please set/export MONGO_URL in production mode.');
	}
	if (!process.env.MAIL_URL) {
		console.log('Var env missing: MAIL_URL');
	}
	if (!process.env.MAIL_FROM) {
		console.log('Var env missing: MAIL_FROM');
	} 
	if (!process.env.FILES_SIZE_PROJECT) {
		console.log('Var env missing: FILE_SIZE_PROJECT');
	}
});
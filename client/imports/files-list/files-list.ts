import 'reflect-metadata';
import { Component} from '@angular/core';
import { MeteorComponent } from 'angular2-meteor';
import { ProjectNav } from '../project-nav/project-nav';
import { RouteParams } from '@angular/router-deprecated';
import { Meteor } from 'meteor/meteor';
import { Modal } from '../modal/modal';
import { Mongo } from 'meteor/mongo';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { MyFiles } from '../../../collections/my-files';
import { Filesize } from '../pipes/pipes';

@Component({
	selector: 'groups-list',
	templateUrl: '/client/imports/files-list/files-list.html',
	directives: [ProjectNav],
	providers: [Modal],
	pipes: [Filesize]
})
@RequireUser()
export class FilesList extends MeteorComponent {

	files: Mongo.Cursor<MyFile>;

	constructor(private params: RouteParams, private modal: Modal) {
		super();
		this.subscribe('projectFiles', params.get('projectId'), () => {
			this.files = MyFiles.find({});
		}, true);
	}
}
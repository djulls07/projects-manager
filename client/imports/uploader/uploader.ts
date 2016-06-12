import 'reflect-metadata';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router-deprecated';
import { InjectUser, LoginButtons } from 'angular2-meteor-accounts-ui';
import { MeteorComponent } from 'angular2-meteor';
import { FileDropDirective } from 'angular2-file-drop';
import { upload } from '../../../collections/my-files';

@Component({
	selector: 'uploader',
	templateUrl: '/client/imports/uploader/uploader.html',
	directives: [RouterLink, LoginButtons, FileDropDirective]
})
@InjectUser('user')
export class Uploader extends MeteorComponent {
	@Input('list') list: Array<any>;
	user: any;
	fileIsOver: boolean = false;
	uploading: boolean = false;

	constructor() {
		super();
	}
	public fileOver(fileIsOver: boolean): void {
		this.fileIsOver = fileIsOver;
	}

	public onFileDrop(file: File): void {
		this.uploading = true;

		upload(file, (result) => {
			this.uploading = false;
			this.list.push(result);
		}, (error) => {
			this.uploading = false;
			console.log(`Something went wrong!`, error);
		});
	}

	ngOnDestroy() {
		// will result in remove of all files € to userId and not linked to a project.
		// ( example case: u upload files creating task but do not valid the task )
		// files do not have any modelId, modelName & project fields ( we check project field )
		Meteor.call('destroyComponentUpload');
	}
	
}
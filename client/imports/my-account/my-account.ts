import 'reflect-metadata';
import { Component } from '@angular/core';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import { RequireUser } from 'angular2-meteor-accounts-ui';
import { Meteor } from 'meteor/meteor';
import { Modal } from '../modal/modal';

@Component({
	selector: 'my-account',
	templateUrl: '/client/imports/my-account/my-account.html',
	providers: [Modal]
})
@RequireUser()
export class MyAccount {

	passForm: ControlGroup;

	constructor(private modal: Modal) {
		let fb = new FormBuilder();
		this.passForm = fb.group({
			oldPassword: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
			password2: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
		});
	}

	changePass(pass) {
		let modal = this.modal;
		if (pass.password !== pass.password2) {
			modal.alert('Passwords are not the same !');
			return;
		}
		Accounts.changePassword(pass.oldPassword, pass.password, function(err) {
			if (err) {
				modal.alert(err.reason);
			} else {
				modal.alert('Password has been changed');
			}
		});
		(<Control>this.passForm.controls['oldPassword']).updateValue('');
		(<Control>this.passForm.controls['password']).updateValue('');
		(<Control>this.passForm.controls['password2']).updateValue('');
	}
}
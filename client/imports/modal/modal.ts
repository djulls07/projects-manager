import 'reflect-metadata';
import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router-deprecated';

@Component({
	selector: 'modal'
})
@Injectable()
export class Modal {

	constructor(private router: Router) {
	}

	alert(message: string, route?) {
		let self = this;
		if (!route) {
			bootbox.alert(message);
		} else {
			bootbox.dialog({
				message: message,
				buttons: {
					success: {	
						label: "Ok",
						className: "btn-primary",
						callback: function() {
							self.router.navigate(route);
						}
					},
				}
			});
		}
	}

	confirm(message, cb1, args1, context: any) {
		bootbox.confirm(message, function(result) {
			if (result) {
				if (!context) {
					cb1(args1);
				} else {
					cb1.call(context, args1);
				}
			}
		});
	}


}
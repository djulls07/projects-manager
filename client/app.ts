import 'reflect-metadata';
/*import 'zone.js/dist/zone';*/
import { Component, provide, enableProdMode } from '@angular/core';
import { bootstrap } from 'angular2-meteor-auto-bootstrap';
import { ROUTER_PROVIDERS, ROUTER_DIRECTIVES, RouteConfig } from '@angular/router-deprecated';
import { APP_BASE_HREF } from '@angular/common';

// navbar everywhere
import { Navbar } from './imports/navbar/navbar';

// routes components
import { Home } from './imports/home/home';
import { ProjectsList } from './imports/projects-list/projects-list';
import { ProjectDetails } from './imports/project-details/project-details';
import { TasksList } from './imports/tasks-list/tasks-list';
import { MyTasksList } from './imports/my-tasks-list/my-tasks-list';
import { WorkingTasksList } from './imports/working-tasks-list/working-tasks-list';
import { TaskDetails } from './imports/task-details/task-details';
import { TaskForm } from './imports/task-form/task-form';
import { ArchivedTasksList } from './imports/archived-tasks-list/archived-tasks-list';
import { Theme } from './imports/theme/theme';
import { GroupsList } from './imports/groups-list/groups-list';
import { ProjectUsersDetails } from './imports/project-users-details/project-users-details';
import { MyAccount } from './imports/my-account/my-account';
import { FilesList } from './imports/files-list/files-list';

Meteor.startup(function() {
  console.log('startup, getting external scripts');
  jQuery.getScript('http://cdn.tinymce.com/4/tinymce.min.js');
});

@Component({
	selector: 'app',
	templateUrl: '/client/app.html',
	directives: [ROUTER_DIRECTIVES, Navbar],
  providers: [Theme]
})
@RouteConfig([
  { path: '/', name: 'Home', component: Home },
  { path: '/myaccount', name: 'MyAccount', component: MyAccount },
  { path: '/projects/list', name: 'ProjectsList', component: ProjectsList },
  { path: '/project/:projectId/details', name: 'ProjectDetails', component: ProjectDetails },
  { path: '/project/:projectId/users/details', name: 'ProjectUsersDetails', component: ProjectUsersDetails },
  { path: '/project/:projectId/users/groups', name: 'GroupsList', component: GroupsList },
  { path: '/project/:projectId/task/add', name: 'TaskForm', component: TaskForm },
  { path: '/project/:projectId/tasks/list', name: 'TasksList', component: TasksList },
  { path: '/project/:projectId/tasks/list/mine', name: 'MyTasksList', component: MyTasksList },
  { path: '/project/:projectId/tasks/list/working', name: 'WorkingTasksList', component: WorkingTasksList },
  { path: '/project/:projectId/tasks/list/archived', name: 'ArchivedTasksList', component: ArchivedTasksList },
  { path: '/project/:projectId/task/:taskId/details', name: 'TaskDetails', component: TaskDetails },
  { path: '/project/:projectId/files/list', name: 'FilesList', component: FilesList }
])
class ProjectsManager {
  constructor(themeService: Theme) {
    themeService.init();
  }
}

enableProdMode();
bootstrap(ProjectsManager, [ROUTER_PROVIDERS, provide(APP_BASE_HREF, { useValue: '/' })]);
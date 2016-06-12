interface Task {
	_id?: string,
	project: string,
	name: string,
	priority: string,
	owner: string,
	ownerEmail: string,
	targets: Array<TaskUser>,
	createdAt: Date,
	dueDate: Date,
	description: string,
	conversation: Array<TaskMessage>,
	archived: boolean,
	completed: boolean,
	validated: boolean,
	archivor?: string,
	completor?: string,
	validator?: string,
	files: Array<string>,
	isSubTask: boolean,
	hasSubTasks: boolean,
	subTasks: Array<string>,
	parentTask?: string
}

interface TaskUser {
	userId: string,
	email: string
}

interface TaskMessage {
	owner: string,
	ownerEmail: string,
	createdAt: Date,
	message: string
}
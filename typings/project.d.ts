interface Project {
	_id?: string,
	name: string,
	owner: string,
	ownerEmail: string,
	createdAt: Date,
	users: Array<ProjectUser>
	groups?: Array<ProjectGroup>
}
interface ProjectUser {
	userId: string,
	email: string
}

interface ProjectGroup {
	name: string,
	users: Array<ProjectUser>
}
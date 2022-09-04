export interface linkIcon {
	url: string;
	type: string;
}

export interface IProject {
	_id: string;
	__v: number;
	title: string;
	description: string;
	tags: string[];
	links: linkIcon[];
	position: number;
	createdAt: Date;
	updatedAt: Date;
}

export type validProjectSort = "title" | "description" | "tags" | "createdAt";
export interface ProjectSort {
	title: (a: IProject, b: IProject) => number;
	description: (a: IProject, b: IProject) => number;
	tags: (a: IProject, b: IProject) => number;
	createdAt: (a: IProject, b: IProject) => number;
}

export interface ProjectQRes {
	data: IProject[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}

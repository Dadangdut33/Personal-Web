export interface IUserForm {
	username: string;
	first_name: string;
	last_name: string;
	email: string;
}
export interface IUser extends IUserForm {
	_id: string;
	__v: number;
	createdAt: Date;
	updatedAt: Date;
}

export type validUserSort = "username" | "createdAt";
export interface UserSort {
	username: (a: IUser, b: IUser) => number;
	createdAt: (a: IUser, b: IUser) => number;
}

export interface UserQRes {
	data: IUser[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}

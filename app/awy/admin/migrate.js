class Awy_Admin_Migrate extends Class {
	constructor() {
		super();
	}
/*
	async install() {
		console.log('admin install');
	}
*/
	async upgrade() {
		console.log('admin upgrade');
	}

	async downgrade() {
		console.log('admin downgrade');
	}
}
export default Awy_Admin_Migrate
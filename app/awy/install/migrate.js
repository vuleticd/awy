class Awy_Install_Migrate extends Class {
	constructor() {
		super();
	}

	async install() {
		console.log('install install');
	}

	async upgrade() {
		console.log('install upgrade');
	}

	async downgrade() {
		console.log('install downgrade');
	}
}
export default Awy_Install_Migrate
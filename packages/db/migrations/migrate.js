const path = require('node:path');
const fs = require('node:fs/promises');

const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

class MigrationManager {
	static read_migrations() {
		const valid_files = /^\d+.+\.sql/;
		return fs.readdir(__dirname).then(files => {
			const migrations = files.filter(file => valid_files.test(file)).sort();

			const migrations_promises = migrations.map(filename => {
				const file_path = path.join(__dirname, filename);
				return fs.readFile(file_path).then(data => {
					const utf8data = data.toString('utf8');
					const statements = utf8data.split(';');

					return statements.map(st => {
						return {
							contents: st,
							filename: filename
						};
					});
				});
			});

			return Promise.all(migrations_promises).then(migrations => {
				return migrations.flat().filter(e => e.contents.trim());
			});
		});
	};

	static chain(migrator, migrations, index=0) {
		const mig = migrations[index];
		if(!mig) {
			return;
		}

		return migrator(migrations[index]).then(() => {
			return sleep(100).then(() => {
				return this.chain(migrator, migrations, index + 1);
			});
		});
	}
}

const migration_manager = new MigrationManager();
module.exports = {
	migration_manager,
	MigrationManager
};

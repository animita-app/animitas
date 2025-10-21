const fs = require('fs');
const path = require('path');
const { sequelize } = require('../../src/models'); // Import the sequelize instance
const { Sequelize } = require('sequelize'); // Import Sequelize class

async function runSeeders() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const seederPath = path.join(__dirname, '../../src/seeders');
    const seederFiles = fs.readdirSync(seederPath).filter(file => file.endsWith('.js'));

    for (const file of seederFiles) {
      const seeder = require(path.join(seederPath, file));
      if (seeder.up) {
        console.log(`Running seeder: ${file}`);
        await seeder.up(sequelize.getQueryInterface(), Sequelize);
      }
    }

    console.log('All seeders executed successfully.');
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSeeders();
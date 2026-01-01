const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker';

async function fixIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\nChecking indexes for collection: ${collectionName}`);
      
      const indexes = await db.collection(collectionName).listIndexes().toArray();
      
      // Find duplicate email indexes
      const emailIndexes = indexes.filter(index => 
        index.key && index.key.email === 1
      );
      
      if (emailIndexes.length > 1) {
        console.log(`Found ${emailIndexes.length} email indexes in ${collectionName}:`);
        emailIndexes.forEach((index, i) => {
          console.log(`  ${i + 1}. Name: ${index.name}, Key: ${JSON.stringify(index.key)}, Unique: ${index.unique}`);
        });
        
        // Drop all but the first email index (keep the one created by unique: true)
        for (let i = 1; i < emailIndexes.length; i++) {
          const indexToDrop = emailIndexes[i];
          console.log(`Dropping duplicate index: ${indexToDrop.name}`);
          await db.collection(collectionName).dropIndex(indexToDrop.name);
        }
      } else {
        console.log('No duplicate email indexes found');
      }
    }

    console.log('\n✅ Index cleanup completed successfully');
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixIndexes();

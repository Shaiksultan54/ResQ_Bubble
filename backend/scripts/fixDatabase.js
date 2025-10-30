import mongoose from 'mongoose';

const fixDatabaseIndexes = async () => {
  try {
    // Connect to database
    await mongoose.connect.process.env.MONGODB_URI;
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Fix agencies collection
    console.log('\n=== Fixing Agencies Collection ===');
    
    // Get current indexes
    const agencyIndexes = await db.collection('agencies').indexes();
    console.log('Current agency indexes:', agencyIndexes.map(idx => idx.name));
    
    // Drop all existing indexes except _id
    for (const index of agencyIndexes) {
      if (index.name !== '_id_') {
        try {
          await db.collection('agencies').dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`ℹ️ Could not drop index ${index.name}:`, error.message);
        }
      }
    }
    
    // Clean up any agencies with null or invalid contactEmail
    const cleanupResult = await db.collection('agencies').deleteMany({
      $or: [
        { contactEmail: null },
        { contactEmail: { $exists: false } },
        { contactEmail: "" }
      ]
    });
    console.log(`✅ Cleaned up ${cleanupResult.deletedCount} invalid agency records`);
    
    // Create new indexes
    try {
      await db.collection('agencies').createIndex({ contactEmail: 1 }, { 
        unique: true,
        sparse: false,
        background: true
      });
      console.log('✅ Created contactEmail unique index');
    } catch (error) {
      console.log('ℹ️ Error creating contactEmail index:', error.message);
    }
    
    try {
      await db.collection('agencies').createIndex({ name: 1 }, { background: true });
      console.log('✅ Created name index');
    } catch (error) {
      console.log('ℹ️ Error creating name index:', error.message);
    }
    
    try {
      await db.collection('agencies').createIndex({ type: 1 }, { background: true });
      console.log('✅ Created type index');
    } catch (error) {
      console.log('ℹ️ Error creating type index:', error.message);
    }
    
    // Verify final indexes
    const finalIndexes = await db.collection('agencies').indexes();
    console.log('\nFinal agency indexes:', finalIndexes.map(idx => idx.name));
    
    // Check for duplicate emails
    const duplicateEmails = await db.collection('agencies').aggregate([
      {
        $group: {
          _id: { $toLower: "$contactEmail" },
          count: { $sum: 1 },
          agencies: { $push: { id: "$_id", name: "$name", email: "$contactEmail" } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();
    
    if (duplicateEmails.length > 0) {
      console.log('\n⚠️ Found duplicate emails:');
      duplicateEmails.forEach(dup => {
        console.log(`Email: ${dup._id}`);
        console.log('Agencies:', dup.agencies);
      });
    } else {
      console.log('\n✅ No duplicate emails found');
    }
    
    console.log('\n✅ Database fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the fix
fixDatabaseIndexes(); 
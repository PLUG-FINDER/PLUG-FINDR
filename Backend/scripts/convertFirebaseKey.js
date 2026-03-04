// Helper script to convert Firebase service account JSON to environment variable format
// Usage: node scripts/convertFirebaseKey.js path/to/serviceAccountKey.json

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('❌ Please provide the path to your Firebase service account JSON file');
  console.log('\nUsage: node scripts/convertFirebaseKey.js <path-to-serviceAccountKey.json>');
  console.log('\nExample: node scripts/convertFirebaseKey.js ../serviceAccountKey.json');
  process.exit(1);
}

const filePath = process.argv[2];

try {
  // Read the JSON file
  const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Convert to single-line JSON string
  const jsonString = JSON.stringify(serviceAccount);
  
  console.log('\n✅ Firebase Service Account JSON converted successfully!\n');
  console.log('📋 Add this to your Backend/.env file:\n');
  console.log('FIREBASE_SERVICE_ACCOUNT=' + jsonString);
  console.log('\n⚠️  Important: Make sure to:');
  console.log('   1. Keep this on a single line');
  console.log('   2. Don\'t add quotes around the JSON');
  console.log('   3. Keep the .env file secure and never commit it to git\n');
  
} catch (error) {
  console.error('❌ Error reading or parsing JSON file:', error.message);
  console.log('\nMake sure:');
  console.log('  - The file path is correct');
  console.log('  - The file is valid JSON');
  console.log('  - You have read permissions for the file');
  process.exit(1);
}



// Test script to debug JSON upload issue

// Create test JSON file
const testData = [
  {
    "admin_username": "test123",
    "amount": "15000",
    "event_timestamp": "2025-01-20 10:30:00",
    "event_type": "usage",
    "description": "تست مصرف اول"
  },
  {
    "admin_username": "test456", 
    "amount": "25000",
    "event_timestamp": "2025-01-20 11:00:00",
    "event_type": "usage",
    "description": "تست مصرف دوم"
  }
];

console.log('Test JSON data:');
console.log(JSON.stringify(testData, null, 2));

// Test parsing logic 
function testParseUsageJsonData(jsonData) {
  try {
    console.log('\n=== Testing parseUsageJsonData ===');
    const data = JSON.parse(jsonData);
    let usageRecords = [];
    
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    if (Array.isArray(data)) {
      console.log('Processing array data, length:', data.length);
      usageRecords = data.filter(item => item && typeof item === 'object');
    }
    
    console.log('Extracted records:', usageRecords.length);
    return usageRecords;
  } catch (error) {
    console.error('Parse error:', error.message);
    return [];
  }
}

function testValidateUsageData(records) {
  console.log('\n=== Testing validateUsageData ===');
  const valid = [];
  const invalid = [];
  
  records.forEach(record => {
    const errors = [];
    
    const username = record.admin_username || record.representative_code;
    if (!username || typeof username !== 'string' || username.trim() === '') {
      errors.push('admin_username یا representative_code وجود ندارد یا خالی است');
    }
    
    const amountValue = parseFloat(record.amount || '0');
    if (!record.amount || isNaN(amountValue) || amountValue <= 0) {
      errors.push(`مبلغ نامعتبر: ${record.amount}`);
    }
    
    if (errors.length === 0) {
      valid.push(record);
    } else {
      invalid.push({ record, errors });
    }
  });
  
  console.log('Valid records:', valid.length);
  console.log('Invalid records:', invalid.length);
  
  if (invalid.length > 0) {
    console.log('Invalid sample:', invalid[0]);
  }
  
  return { valid, invalid };
}

// Run tests
const jsonString = JSON.stringify(testData);
const parsed = testParseUsageJsonData(jsonString);
const validated = testValidateUsageData(parsed);

console.log('\n=== Final Results ===');
console.log('Should work with this data structure:', validated.valid.length > 0);
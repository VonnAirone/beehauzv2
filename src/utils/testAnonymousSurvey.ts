// Test file to debug anonymous survey submissions
// Run this in your app to test anonymous survey functionality

import { surveyService } from '../services/surveyService';

export const testAnonymousSurvey = async () => {
  console.log('=== Starting Anonymous Survey Test ===');
  
  // Test 1: Check connection
  console.log('1. Testing Supabase connection...');
  const connectionTest = await surveyService.testConnection();
  console.log('Connection test result:', connectionTest);
  
  // Test 2: Test direct anonymous submission
  console.log('2. Testing direct anonymous submission...');
  const directTest = await surveyService.testAnonymousSubmission('test.anonymous@example.com');
  console.log('Direct test result:', directTest);
  
  // Test 3: Test through normal flow
  console.log('3. Testing through normal survey flow...');
  const normalTest = await surveyService.submitSurveyResponse({
    service_type: 'delivery',
    response_level: 'maybe',
    user_email: 'test.normal@example.com',
    user_type: 'tenant'
  });
  console.log('Normal flow test result:', normalTest);
  
  console.log('=== Anonymous Survey Test Complete ===');
  
  return {
    connection: connectionTest,
    direct: directTest,
    normal: normalTest
  };
};

// Usage: Call this function from your app to test
// testAnonymousSurvey().then(results => console.log('All test results:', results));
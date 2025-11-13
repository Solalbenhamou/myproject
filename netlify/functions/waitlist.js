const fetch = require('node-fetch');

exports.handler = async (event) => {
  console.log('=== NETLIFY FUNCTION CALLED ===');
  console.log('Method:', event.httpMethod);
  console.log('Body:', event.body);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('OPTIONS request - returning CORS headers');
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, source, timestamp } = JSON.parse(event.body);
    console.log('Parsed email:', email);

    if (!email) {
      console.log('ERROR: No email provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Email is required' })
      };
    }

    const n8nUrl = 'https://n8n-943439003979.us-central1.run.app/webhook-test/waiting-list';
    console.log('Calling n8n at:', n8nUrl);
    
    const payload = {
      email: email,
      source: source || 'email_click',
      timestamp: timestamp || new Date().toISOString()
    };
    console.log('Payload:', JSON.stringify(payload));

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('n8n response status:', response.status);
    const data = await response.json();
    console.log('n8n response data:', JSON.stringify(data));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Added to waitlist',
        email: email 
      })
    };
  } catch (error) {
    console.error('ERROR in function:', error.message);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};

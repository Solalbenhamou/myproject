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
```

**Commit ce changement.**

---

## **Test 2 : Vérifier les logs Netlify**

1. Va sur **Netlify → Functions**
2. Clique sur **"waitlist"**
3. Clique sur l'onglet **"Logs"** ou **"Function log"**
4. Teste à nouveau : `https://capable-brioche-ca1de0.netlify.app/waitlist.html?email=test@test.com`
5. **Regarde les logs** - tu devrais voir tous les `console.log`

**Dis-moi ce que tu vois dans les logs !**

---

## **Test 3 : Vérifier l'URL du webhook n8n**

### **Dans ton workflow n8n :**

1. Clique sur **NODE 1 (Webhook POST)**
2. Vérifie que le **Path** est bien : `waiting-list`
3. Copie l'URL complète affichée sous **"Production URL"**

**Elle devrait être exactement :**
```
https://n8n-943439003979.us-central1.run.app/webhook-test/waiting-list

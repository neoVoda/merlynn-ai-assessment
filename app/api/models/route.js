import axios from 'axios';

export async function GET(request) {
  try {
    
    const response = await axios.get('https://api.up2tom.com/v3/models', {
      headers: {
        'Authorization': `Token ${process.env.TOM_API_KEY}`,
        'Content-Type': 'application/vnd.api+json'
      },
      proxy: false 
    });
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/vnd.api+json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

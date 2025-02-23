// app/api/decision/route.js
import axios from 'axios';
import connectDB from '@/lib/mongodb';
import Decision from '@/models/Decision';

export async function POST(request) {
  try {
    const { modelId, inputData } = await request.json();

    const response = await axios.post(
      `https://api.up2tom.com/v3/decision/${modelId}`,
      inputData,
      {
        headers: {
          'Authorization': `Token ${process.env.TOM_API_KEY}`,
          'Content-Type': 'application/vnd.api+json'
        },
        proxy: false
      }
    );

    await connectDB();
    await Decision.create({
      modelId,
      inputData,
      decisionResult: response.data
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/vnd.api+json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

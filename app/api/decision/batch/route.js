import axios from 'axios';
import connectDB from '@/lib/mongodb';
import Decision from '@/models/Decision';

export async function POST(request) {
  try {
    const { modelId, batchInputs } = await request.json();

    const response = await axios.post(`https://api.up2tom.com/v3/decision/batch/${modelId}`, { inputs: batchInputs }, {
      headers: {
        'Authorization': `Token ${process.env.TOM_API_KEY}`,
        'Content-Type': 'application/vnd.api+json'
      },
      proxy: false 
    });

    await connectDB();
    const decisions = response.data;
    for (let i = 0; i < decisions.length; i++) {
      await Decision.create({
        modelId,
        inputData: batchInputs[i],
        decisionResult: decisions[i]
      });
    }

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/vnd.api+json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

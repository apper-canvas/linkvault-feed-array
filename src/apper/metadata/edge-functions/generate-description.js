// Import required globals for custom action environment
const apper = globalThis.apper || {
  serve: (handler) => {
    globalThis.handler = handler;
  },
  getSecret: async (key) => {
    return globalThis.Deno?.env?.get?.(key) || process?.env?.[key];
  }
};

const Response = globalThis.Response || function(body, init) {
  return new globalThis.Response(body, init);
};

// Export handler function for edge function environment
export default async function handler(request) {
  try {
    if (request.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        } })
    }
    // Parse request body
    const { title } = await request.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get OpenAI API key from secrets
    const apiKey = await apper.getSecret('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, informative descriptions for bookmarks. Generate a 1-2 sentence description based on the bookmark title that explains what the user might find at this link.'
          },
          {
            role: 'user',
            content: `Generate a brief description for this bookmark title: "${title}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate description' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await openaiResponse.json();
    const generatedDescription = data.choices?.[0]?.message?.content?.trim();

    if (!generatedDescription) {
      return new Response(
        JSON.stringify({ success: false, error: 'No description generated' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        description: generatedDescription 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-description custom action:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
);
  }
}

// Also support apper.serve pattern if available
if (apper && typeof apper.serve === 'function') {
  apper.serve(handler);
}
// AI Vision Service for Kibble Label Scanning (Phase 1B)

export interface KibbleNutrition {
  protein: number;
  fat: number;
  fiber: number;
  calcium: number;
  phosphorus: number;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
}

// Parse kibble nutrition from image using LLM Vision API
export async function scanKibbleLabel(imageBase64: string): Promise<KibbleNutrition> {
  const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-vision',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this dog food label and extract the guaranteed analysis nutritional information. Look for:\n\n1. Crude Protein (min %)
2. Crude Fat (min %)
3. Crude Fiber (max %)
4. Calcium (min/max %)
5. Phosphorus (min/max %)\n\nRespond in JSON format only:\n{
  "protein": number,
  "fat": number,
  "fiber": number,
  "calcium": number,
  "phosphorus": number,
  "confidence": "high" | "medium" | "low",
  "rawText": "any additional notes"
}\n\nIf you cannot find a value, use 0. Rate confidence based on label clarity.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI Vision API failed: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from AI Vision API');
  }

  const nutrition: KibbleNutrition = JSON.parse(content);
  return nutrition;
}

// Generate recipe description for image generation
export async function generateRecipeDescription(recipeName: string, ingredients: Array<{ name: string }>): Promise<string> {
  const ingredientList = ingredients.map(i => i.name).join(', ');
  
  const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: `Create a vivid, appealing description for a dog food recipe photo. The recipe is called "${recipeName}" and contains: ${ingredientList}. \n\nDescribe what the prepared meal should look like in a bowl - focus on colors, textures, and appetizing presentation. Keep it under 100 words. This description will be used to generate a realistic food photo.`
        }
      ],
      max_tokens: 150
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate recipe description');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'A nutritious homemade dog meal in a bowl';
}

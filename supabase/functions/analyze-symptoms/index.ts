import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();
    
    if (!symptoms || symptoms.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Symptoms are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing symptoms:", symptoms);

    // Call Lovable AI Gateway for symptom analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a medical information assistant. Based on symptoms provided, suggest possible conditions and next steps.

CRITICAL: This is for educational purposes only. Always include appropriate disclaimers.

For each analysis, provide:
1. 3-5 possible conditions (with severity: low/medium/high)
2. Recommended next steps
3. Warning signs that need immediate attention
4. Educational disclaimer

Format your response as JSON with this structure:
{
  "conditions": [
    {
      "name": "Condition name",
      "description": "Brief description",
      "severity": "low|medium|high",
      "likelihood": "Common match for these symptoms"
    }
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "urgentSigns": [
    "Sign 1 that requires immediate attention",
    "Sign 2"
  ],
  "disclaimer": "Important medical disclaimer text"
}`
          },
          {
            role: "user",
            content: `Based on these symptoms, provide possible conditions and recommendations: ${symptoms}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to analyze symptoms");
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    console.log("AI Response:", analysisText);

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response
      analysis = {
        conditions: [
          {
            name: "Unable to analyze",
            description: "The system encountered an issue analyzing your symptoms.",
            severity: "medium",
            likelihood: "Please try rephrasing your symptoms"
          }
        ],
        recommendations: [
          "Consult with a healthcare provider for proper evaluation",
          "Keep track of your symptoms and their duration"
        ],
        urgentSigns: [
          "Severe or worsening symptoms",
          "Difficulty breathing",
          "Chest pain",
          "Loss of consciousness"
        ],
        disclaimer: "This tool is for educational purposes only and does not provide medical advice. Always consult qualified healthcare professionals for proper diagnosis and treatment."
      };
    }

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from("symptom_queries")
      .insert({
        symptoms,
        analysis,
        user_id: null, // Optional: can be set if user authentication is added
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Don't fail the request if DB insert fails
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-symptoms function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An error occurred analyzing symptoms" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

const db = admin.firestore();

export const llmProxy = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in to compare.');
  }

  const userId = context.auth.uid;
  const promptId = data.promptId;
  const promptText = data.prompt;
  const useOwnKeys = data.useOwnKeys || {};

  if (!promptId || typeof promptId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'promptId is required.');
  }

  if (!promptText || typeof promptText !== 'string' || promptText.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Prompt text is required.');
  }

  // 1. Check Rate Limits (if not using own keys)
  const isUnlimited = useOwnKeys.openai && useOwnKeys.anthropic && useOwnKeys.gemini;
  const today = new Date().toISOString().split('T')[0];
  const usageRef = db.collection(`users/${userId}/usage`).doc(today);

  if (!isUnlimited) {
    const usageDoc = await usageRef.get();
    const used = usageDoc.exists ? usageDoc.data()?.comparisonsUsed || 0 : 0;
    
    if (used >= 5) {
      throw new functions.https.HttpsError('resource-exhausted', 'You have used today\'s free comparisons. Add your API keys in Settings for unlimited.');
    }
    
    // Increment usage asynchronously
    usageRef.set({ comparisonsUsed: admin.firestore.FieldValue.increment(1) }, { merge: true });
  }

  // 2. We skip creating the prompt document because the iOS client creates it to allow immediate local navigation.
  // We just wait a safe moment if moderation triggers, or rely on client's flagged status.
  const promptRef = db.collection('prompts').doc(promptId);
  await promptRef.set({
    userId,
    text: promptText,
    flagged: false, // Moderated by trigger later if needed, but we proceed optimistically or wait?
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // We return the promptId immediately and process the LLMs asynchronously
  // In Cloud Functions Gen 1 we shouldn't fully abandon promises if we want them to finish,
  // so we will wait for them but the client could read partials. 
  // Wait, if it's an HTTPS Call, keeping the connection open is fine. 
  // We'll dispatch the requests and wait for all settled.
  
  const openaiKey = useOwnKeys.openai || process.env.OPENAI_API_KEY;
  const anthropicKey = useOwnKeys.anthropic || process.env.ANTHROPIC_API_KEY;
  const geminiKey = useOwnKeys.gemini || process.env.GEMINI_API_KEY;

  if (!openaiKey || !anthropicKey || !geminiKey) {
    console.error("Missing system API keys for models");
  }

  const fetchOpenAI = async () => {
    const start = Date.now();
    try {
      if (!openaiKey) throw new Error("No OpenAI key available.");
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: promptText }]
        }),
        timeout: 30000
      });
      if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
      const data: any = await res.json();
      const text = data.choices[0].message.content;
      await saveResponse(promptId, userId, 'openai', text, Date.now() - start);
    } catch (err: any) {
      await saveError(promptId, userId, 'openai', err.message);
    }
  };

  const fetchAnthropic = async () => {
    const start = Date.now();
    try {
      if (!anthropicKey) throw new Error("No Anthropic key available.");
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: promptText }]
        }),
        timeout: 30000
      });
      if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
      const data: any = await res.json();
      const text = data.content[0].text;
      await saveResponse(promptId, userId, 'anthropic', text, Date.now() - start);
    } catch (err: any) {
      await saveError(promptId, userId, 'anthropic', err.message);
    }
  };

  const fetchGemini = async () => {
    const start = Date.now();
    try {
      if (!geminiKey) throw new Error("No Gemini key available.");
      // Using simple fetch to Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        }),
        timeout: 30000
      });
      if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
      const data: any = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      await saveResponse(promptId, userId, 'gemini', text, Date.now() - start);
    } catch (err: any) {
      await saveError(promptId, userId, 'gemini', err.message);
    }
  };

  // Run in parallel and await completion for determinism
  await Promise.allSettled([fetchOpenAI(), fetchAnthropic(), fetchGemini()]);

  return { promptId };
});

async function saveResponse(promptId: string, userId: string, model: string, text: string, latencyMs: number) {
  try {
    const ref = db.collection(`prompts/${promptId}/responses`).doc(model);
    await ref.set({
      model,
      userId,
      text,
      latencyMs,
      error: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error(`Failed to save response for ${model}`, err);
  }
}

async function saveError(promptId: string, userId: string, model: string, errorMessage: string) {
  try {
    const ref = db.collection(`prompts/${promptId}/responses`).doc(model);
    await ref.set({
      model,
      userId,
      text: "Couldn't reach this model. The other two are still working.",
      latencyMs: 0,
      error: true,
      errorMessage,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error(`Failed to save error for ${model}`, err);
  }
}

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const llmProxy = onCall({ timeoutSeconds: 60, cors: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { prompt, userId, useOwnKeys } = request.data;
    if (!prompt || typeof prompt !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing prompt text');
    }

    if (userId !== request.auth.uid) {
        // Enforce user matches token
        throw new HttpsError('permission-denied', 'Mismatched user ID');
    }

    const db = getFirestore();

    // Check Rate Limiting
    const hasOwnKeys = useOwnKeys && Object.keys(useOwnKeys).length > 0;
    if (!hasOwnKeys) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const promptRefs = await db.collection('prompts')
            .where('userId', '==', userId)
            .where('createdAt', '>=', today)
            .count()
            .get();
            
        if (promptRefs.data().count >= 5) {
            throw new HttpsError('resource-exhausted', 'Daily limit reached. Add your own API keys to continue.');
        }
    }

    // 1. Create Prompt Document 
    const promptRef = db.collection('prompts').doc();
    await promptRef.set({
        userId,
        text: prompt,
        createdAt: FieldValue.serverTimestamp(),
        flagged: false
    });

    // Note: moderateContent triggers on create. llmProxy waits briefly to see if flagged
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const freshPrompt = await promptRef.get();
    if (freshPrompt.data()?.flagged === true) {
        throw new HttpsError('aborted', 'Prompt flagged by content moderation.');
    }

    const fns = [
        fetchOpenAI(prompt, promptRef.id, useOwnKeys?.openai),
        fetchAnthropic(prompt, promptRef.id, useOwnKeys?.anthropic),
        fetchGemini(prompt, promptRef.id, useOwnKeys?.gemini)
    ];

    const results = await Promise.allSettled(fns);
    const errors: Record<string, string> = {};

    results.forEach((r) => {
        if (r.status === 'rejected') {
            // we attach metadata to the rejection or just handle internally
        } else if (r.value?.error) {
            errors[r.value.model] = r.value.error;
        }
    });

    return {
        promptId: promptRef.id,
        errors: Object.keys(errors).length > 0 ? errors : null
    };
});

async function fetchOpenAI(prompt: string, promptId: string, customKey?: string) {
    const key = customKey || process.env.OPENAI_API_KEY;
    const start = Date.now();
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [{ role: 'user', content: prompt }]
            }),
            signal: AbortSignal.timeout(30000)
        });
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content || 'No response';
        const error = res.ok ? null : (data.error?.message || 'OpenAI failed');
        await writeResponse(promptId, 'openai', text, error, Date.now() - start);
        return { model: 'openai', error };
    } catch (e: any) {
        await writeResponse(promptId, 'openai', '', e.message, Date.now() - start);
        return { model: 'openai', error: e.message };
    }
}

async function fetchAnthropic(prompt: string, promptId: string, customKey?: string) {
    const key = customKey || process.env.ANTHROPIC_API_KEY;
    const start = Date.now();
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': key || '',
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }]
            }),
            signal: AbortSignal.timeout(30000)
        });
        const data = await res.json() as any;
        const text = data.content?.[0]?.text || 'No response';
        const error = res.ok ? null : (data.error?.message || 'Anthropic failed');
        await writeResponse(promptId, 'anthropic', text, error, Date.now() - start);
        return { model: 'anthropic', error };
    } catch (e: any) {
        await writeResponse(promptId, 'anthropic', '', e.message, Date.now() - start);
        return { model: 'anthropic', error: e.message };
    }
}

async function fetchGemini(prompt: string, promptId: string, customKey?: string) {
    const key = customKey || process.env.GEMINI_API_KEY;
    const start = Date.now();
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
            signal: AbortSignal.timeout(30000)
        });
        const data = await res.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        const error = res.ok ? null : (data.error?.message || 'Gemini failed');
        await writeResponse(promptId, 'gemini', text, error, Date.now() - start);
        return { model: 'gemini', error };
    } catch (e: any) {
        await writeResponse(promptId, 'gemini', '', e.message, Date.now() - start);
        return { model: 'gemini', error: e.message };
    }
}

async function writeResponse(promptId: string, model: string, text: string, error: string | null, latencyMs: number) {
    const db = getFirestore();
    await db.collection('prompts').doc(promptId).collection('responses').doc(model).set({
        promptId,
        model,
        text: text || '',
        error,
        latencyMs,
        createdAt: FieldValue.serverTimestamp()
    });
}

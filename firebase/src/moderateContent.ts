import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

export const moderateContent = onDocumentCreated('prompts/{promptId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    if (!data || !data.text) return;

    const apiKey = process.env.PERSPECTIVE_API_KEY;
    if (!apiKey) {
        console.warn('No Perspective API key found. Skipping moderation.');
        return;
    }

    try {
        const res = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: { text: data.text },
                languages: ['en'],
                requestedAttributes: {
                    TOXICITY: {},
                    SEVERE_TOXICITY: {}
                }
            })
        });

        if (!res.ok) {
            console.error('Perspective API failed:', await res.text());
            return;
        }

        const result = await res.json() as any;
        const toxScore = result.attributeScores?.TOXICITY?.summaryScore?.value || 0;
        const sevToxScore = result.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value || 0;

        if (toxScore > 0.8 || sevToxScore > 0.8) {
            await getFirestore().collection('prompts').doc(event.params.promptId).update({
                flagged: true
            });
            console.log(`Prompt ${event.params.promptId} flagged for toxicity: ${toxScore}`);
        }
    } catch (err) {
        console.error('Error during content moderation', err);
    }
});

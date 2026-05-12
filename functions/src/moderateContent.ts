import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

export const moderateContent = functions.firestore
  .document('prompts/{promptId}')
  .onCreate(async (snap, context) => {
    const promptData = snap.data();
    if (!promptData || !promptData.text) return;

    const perspectiveKey = process.env.PERSPECTIVE_API_KEY;
    if (!perspectiveKey) {
      console.warn("No PERSPECTIVE_API_KEY set. Skipping moderation.");
      return;
    }

    try {
      const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${perspectiveKey}`;
      const requestData = {
        comment: { text: promptData.text },
        languages: ["en"],
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {}
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result: any = await res.json();
      
      let flagged = false;
      if (result && result.attributeScores) {
        const toxicity = result.attributeScores.TOXICITY?.summaryScore?.value || 0;
        const severeToxicity = result.attributeScores.SEVERE_TOXICITY?.summaryScore?.value || 0;

        if (toxicity > 0.8 || severeToxicity > 0.8) {
          flagged = true;
        }
      }

      if (flagged) {
        await snap.ref.update({ flagged: true });
        console.log(`Prompt ${snap.id} flagged for toxicity.`);
      }

    } catch (error) {
      console.error("Error calling Perspective API:", error);
    }
  });

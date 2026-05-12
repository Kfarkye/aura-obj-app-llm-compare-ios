import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const deleteAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const userId = context.auth.uid;

  try {
    // 1. Delete Prompts & Responses
    const promptsSnap = await db.collection('prompts').where('userId', '==', userId).get();
    
    // Batch deletes have a 500 limit. For simplicity in v1, assuming less or multiple batches
    let batch = db.batch();
    let count = 0;

    for (const doc of promptsSnap.docs) {
      // Subcollections (responses) are not automatically deleted by Firestore
      // MUST delete responses first
      const responsesSnap = await doc.ref.collection('responses').get();
      for (const resDoc of responsesSnap.docs) {
        batch.delete(resDoc.ref);
        count++;
        if (count >= 450) {
          await batch.commit();
          batch = db.batch();
          count = 0;
        }
      }
      batch.delete(doc.ref);
      count++;
      if (count >= 450) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }

    // 2. Delete Ratings
    const ratingsSnap = await db.collection('ratings').where('userId', '==', userId).get();
    for (const ratingDoc of ratingsSnap.docs) {
      batch.delete(ratingDoc.ref);
      count++;
      if (count >= 450) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    // Note: The aggregateRankings will trigger automatically on rating deletes and recalculate stats.

    // 3. Delete user doc & usage
    const usageSnap = await db.collection(`users/${userId}/usage`).get();
    let uBatch = db.batch();
    for (const uDoc of usageSnap.docs) {
      uBatch.delete(uDoc.ref);
    }
    uBatch.delete(db.collection('users').doc(userId));
    await uBatch.commit();

    // 4. Delete Auth
    await admin.auth().deleteUser(userId);

    return { success: true };
  } catch (error: any) {
    console.error("Account deletion error:", error);
    throw new functions.https.HttpsError('internal', 'Failed to delete account.', error.message);
  }
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const deleteAccount = onCall({ timeoutSeconds: 120 }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const userId = request.auth.uid;
    const db = getFirestore();

    const batch = db.batch();

    // 1. Delete Prompts & Responses
    const promptsSnap = await db.collection('prompts').where('userId', '==', userId).get();
    for (const promptDoc of promptsSnap.docs) {
        // Find subcollections (responses)
        const responsesSnap = await promptDoc.ref.collection('responses').get();
        responsesSnap.forEach(rDoc => batch.delete(rDoc.ref));
        batch.delete(promptDoc.ref);
    }

    // 2. Delete Ratings
    const ratingsSnap = await db.collection('ratings').where('userId', '==', userId).get();
    ratingsSnap.forEach(ratingDoc => batch.delete(ratingDoc.ref));

    // Notice: Ratings deletion will trigger aggregateRankings to adjust the scores automatically down.

    // 3. Delete user doc
    const userDocRef = db.collection('users').doc(userId);
    batch.delete(userDocRef);

    // Commit db deletes
    await batch.commit();

    // 4. Delete Auth user
    await getAuth().deleteUser(userId);

    return { success: true };
});

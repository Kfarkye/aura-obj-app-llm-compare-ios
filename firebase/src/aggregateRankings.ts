import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const aggregateRankings = onDocumentWritten('ratings/{ratingId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before && !after) return; // shouldn't happen unless completely deleted logic error

    const model = (after?.model || before?.model) as string;
    if (!model) return;

    const db = getFirestore();
    const rankingRef = db.collection('rankings').doc(model);

    await db.runTransaction(async (transaction) => {
        const rankingDoc = await transaction.get(rankingRef);
        let totalRatings = 0;
        let averageRating = 0.0;
        
        if (rankingDoc.exists) {
            totalRatings = rankingDoc.data()?.totalRatings || 0;
            averageRating = rankingDoc.data()?.averageRating || 0;
        }

        let oldScore = 0;
        let newScore = 0;

        if (before) {
            oldScore = before.score;
        }
        if (after) {
            newScore = after.score;
        }

        // Adjust via deltas
        const totalScore = (averageRating * totalRatings) - oldScore + newScore;
        
        if (!before && after) {
            // Create
            totalRatings += 1;
        } else if (before && !after) {
            // Delete
            totalRatings -= 1;
        } else if (before && after) {
            // Update
            // count stays the same
        }

        if (totalRatings > 0) {
            averageRating = totalScore / totalRatings;
        } else {
            averageRating = 0;
        }

        transaction.set(rankingRef, {
            model,
            averageRating,
            totalRatings,
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
    });
});

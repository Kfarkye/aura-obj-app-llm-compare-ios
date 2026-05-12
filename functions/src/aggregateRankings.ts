import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const aggregateRankings = functions.firestore
  .document('ratings/{ratingId}')
  .onWrite(async (change, context) => {
    // If deleted
    const isDelete = !change.after.exists;
    const data = isDelete ? change.before.data() : change.after.data();
    
    if (!data) return;

    const model = data.model;
    const oldScore = change.before.exists ? change.before.data()?.score : 0;
    const newScore = isDelete ? 0 : data.score;

    if (oldScore === newScore && !isDelete) {
      // Score didn't change
      return;
    }

    const rankRef = db.collection('rankings').doc(model);

    await db.runTransaction(async (transaction) => {
      const rankDoc = await transaction.get(rankRef);
      
      let averageScore = 0;
      let totalRatings = 0;
      let sparklineData: number[] = Array(30).fill(0);

      if (rankDoc.exists) {
        const d = rankDoc.data()!;
        averageScore = d.averageScore || 0;
        totalRatings = d.totalRatings || 0;
        sparklineData = d.sparklineData || Array(30).fill(0);
      }

      const totalSum = averageScore * totalRatings;
      let newTotalRatings = totalRatings;
      let newTotalSum = totalSum;

      if (change.before.exists && !isDelete) {
        // Update existing rating
        newTotalSum = totalSum - oldScore + newScore;
      } else if (!change.before.exists && !isDelete) {
        // New rating
        newTotalRatings += 1;
        newTotalSum += newScore;
      } else if (isDelete) {
        // Delete rating
        newTotalRatings = Math.max(0, newTotalRatings - 1);
        newTotalSum = Math.max(0, newTotalSum - oldScore);
      }

      const newAverage = newTotalRatings > 0 ? newTotalSum / newTotalRatings : 0;

      // Dummy sparkline logic just for v1 - push a slightly varied score at the end
      sparklineData.shift();
      sparklineData.push(newAverage > 0 ? newAverage : 0);

      transaction.set(rankRef, {
        averageScore: newAverage,
        totalRatings: newTotalRatings,
        sparklineData: sparklineData,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
  });

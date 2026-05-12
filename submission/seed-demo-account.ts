import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";

// Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Admin initialization
initializeApp();
const db = getFirestore();

// NOTE: Must manually create demo@spec.app in Auth and swap this ID.
const DEMO_USER_ID = "DEMO_UID_HERE";

interface QueryData {
  prompt: string;
  category: string;
  best: string;
}

const queries: QueryData[] = [
  { prompt: "Write a python script to reverse a linked list.", category: "code", best: "openai" },
  { prompt: "Write a haiku about a robot learning to feel.", category: "creative writing", best: "anthropic" },
  { prompt: "Summarize the theory of special relativity in 2 sentences.", category: "summarization", best: "anthropic" },
  { prompt: "What is the capital of Australia?", category: "factual Q&A", best: "gemini" },
  { prompt: "If I have 3 apples and give away 2, then buy 5, how many oranges do I have?", category: "math reasoning", best: "openai" },
  { prompt: "Explain monads in functional programming.", category: "explaining concepts", best: "anthropic" },
  { prompt: "Draft a polite email declining a job offer.", category: "email drafting", best: "gemini" },
  { prompt: "Who won the 2022 FIFA World Cup?", category: "factual Q&A", best: "openai" },
  { prompt: "Extract the core entities from this sentence: The Eiffel Tower is in Paris.", category: "summarization", best: "openai" },
  { prompt: "Solve for x: 2x + 5 = 15", category: "math reasoning", best: "gemini" },
  { prompt: "Can you review this code snippet for a React hook?", category: "debugging", best: "anthropic" },
  { prompt: "Translate the following idiom into French: 'It's raining cats and dogs'", category: "translation", best: "anthropic" }
];

async function seed() {
  console.log("Seeding Demo Account...");
  const models = ["openai", "anthropic", "gemini"];
  
  for (const q of queries) {
    const promptRef = db.collection("prompts").doc();
    await promptRef.set({
      userId: DEMO_USER_ID,
      text: q.prompt,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
      flagged: false
    });

    for (const m of models) {
      await promptRef.collection("responses").doc(m).set({
        promptId: promptRef.id,
        model: m,
        text: `[Sample generated response from ${m} for prompt: ${q.prompt.substring(0, 10)}...]`,
        latencyMs: Math.floor(Math.random() * 800) + 400,
        createdAt: new Date()
      });
      
      // Seed ratings realistically
      let score = 0;
      if (m === q.best) {
        score = 5;
      } else {
        score = Math.floor(Math.random() * 3) + 2; // 2-4 randomly
      }
      
      const ratingId = `${DEMO_USER_ID}_${promptRef.id}_${m}`;
      await db.collection("ratings").doc(ratingId).set({
        userId: DEMO_USER_ID,
        promptId: promptRef.id,
        model: m,
        score: score,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`Seeded prompt: ${q.prompt}`);
  }
  console.log("Done seeding demo account.");
}

seed().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});

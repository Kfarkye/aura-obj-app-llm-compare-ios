# Screenshots Spec

The 5 required App Store screenshots should show the following exact UI states, captured on an iPhone 15 Pro Max simulator in light mode.

**Screenshot 1: The Prompt Input (Clean State)**
- **State:** `PromptInputView` with the suggested prompt visible, and an empty input field.
- **Content:** The top bar with the logo and the background showing off-white `#F5F2EC`. The "Compare" button is present at the bottom.
- **Caption:** Ask one question. Three models answer.

**Screenshot 2: Streaming Responses**
- **State:** `ComparisonView` mid-stream.
- **Content:** The prompt is pinned at the top. The first card (GPT-4) shows complete text. The second card (Claude) is halfway through generating with a blinking green cursor. The third card (Gemini) shows the pulsing loading dots at 30% accent green. 
- **Caption:** Read them side by side.

**Screenshot 3: The Rated Comparison (Hero)**
- **State:** `ComparisonView` completed and rated.
- **Content:** All three responses are complete. The user has tapped 5 stars on the Claude response. The Claude card has the accent green border (`#2B5F3F`, 1.5pt) indicating it was selected as the best answer, and the footer reads "Selected best".
- **Caption:** Pick the one that fit.

**Screenshot 4: The History View**
- **State:** `HistoryListView` with populated data.
- **Content:** A list of 6 past comparisons showing the prompt text truncated, the meta row with the three badges, the date, and the average rating in accent green. The search bar at the top has "Explain" entered.
- **Caption:** Every comparison, searchable.

**Screenshot 5: The Global Rankings**
- **State:** `RankingsView`.
- **Content:** The three model cards sorted by community score. Claude at #1 with a 4.5 average, GPT-4 at #2 with a 4.1, Gemini at #3 with 3.9. The sparklines show recent rating trends, and Claude has the faint accent green border indicating current lead.
- **Caption:** See which AI wins, by your standard.

*(For iPad Pro 13" screenshots, use Screenshots 1, 3, and 5 above, utilizing the multi-column iPad layouts for ComparisonView and RankingsView).*

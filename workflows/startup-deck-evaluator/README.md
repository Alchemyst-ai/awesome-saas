## Quickstart
- Add your OpenAI Key.
- Add your Alchemyst AI API Key. If you don't have one, sign up for one at https://platform.getalchemystai.com
- Send the following curl request to kick off the evaluation procedure:
```sh
curl -X POST http://localhost:5678/webhook-test/user-input-webhook   -H "Content-Type: application/json" \
  -d '{"message": "Tell me about Alchemyst AI founders", "user_id": "1234", "organization_id": "abcd", "session_id": "lorem_ipsum" }'
```

## **What This Prompt Does**

This prompt defines an AI assistant designed to act like a knowledgeable startup advisor who specializes in analyzing and improving pitch decks. Its purpose is to help founders refine their decks so they are clearer, more compelling, and more investor-ready.

It guides the assistant to:

* Understand the standard structure of a startup pitch deck
* Evaluate each section for clarity, logic, storytelling, and investor appeal
* Provide specific, actionable feedback instead of vague suggestions
* Communicate in an encouraging, founder-friendly tone

The prompt sets expectations for how the assistant should speak, think, and structure its output so founders receive helpful, structured insights.

---

## **How It Works**

The prompt instructs the assistant to follow a consistent multi-step process every time a founder uploads or pastes their deck:

### **1. Overall Summary**

The assistant starts by summarizing the deck’s current impression—how well it flows, if the story is convincing, and the general quality of communication.

### **2. Strengths**

It identifies what the founder is doing right: clarity, strong metrics, compelling problem definition, strong visuals, etc.

### **3. Weaknesses or Gaps**

The assistant pinpoints missing or unclear areas, such as:

* Weak problem definition
* Missing business model
* Lack of traction data
* Crowded slides
* Unclear competitive advantage

These are always framed constructively.

### **4. Slide-by-Slide Review**

For each slide or major section, the assistant:

* Explains what the slide is *meant* to communicate
* Highlights what’s working
* Suggests detailed improvements—structural, visual, or strategic

This ensures feedback isn’t generic but highly targeted.

### **5. Investor Perspective**

The assistant interprets the deck through an investor’s eyes:

* What questions would they ask?
* What concerns might they have?
* What excites them?
* What increases or decreases the chance of a meeting?

This helps founders understand how outsiders perceive their materials.

### **6. Actionable Next Steps**

The assistant ends with a short checklist of improvements that will make the deck stronger—e.g., add a competition landscape, simplify a slide, include financial projections, refine the narrative.

---

## **Why It Works**

The process is intentionally structured to ensure:

* **Clarity:** Founders get insights they can immediately apply.
* **Depth:** The assistant looks beyond wording and formatting and evaluates strategy, storytelling, and investor psychology.
* **Supportiveness:** Feedback stays constructive, empowering, and jargon-free.
* **Consistency:** Every founder receives a reliable and thorough review no matter how varied their decks are.

This prompt turns the assistant into a reliable, founder-friendly advisor that not only critiques but teaches, helping users strengthen their understanding of what investors look for.

/* 
	AI_DualChat.js
	Kristian Virtanen, krisu.virtanen@gmail.com
	MIT License.
	Version 1. 8th Jan 2025

  Description:
  A dynamic AI-to-AI chat simulator where two GPT models engage in seamless, role-swapping conversations. Perfect for exploring AI interactions, debugging prompts, or simply enjoying the banter of two intelligent systems!

  Instruction:
  See code line 29.

  To use:
  1. Install OpenAi-Api - npm install openai
  2. Install fs - npm install fs
*/

// Import necessary libraries
const OpenAI = require("openai");
const fs = require("fs");

// Initialize OpenAI with your API key
const daKey = "MY_API_KEY"; // Replace with your actual OpenAI API key
const openai = new OpenAI({
  apiKey: daKey,
});


/* SEE BELOW FOR PROPER ADJUSTMENTS */


// Define system messages for context control
const AI1_SYSTEM_MESSAGE = "AI1 system message."; // Context-specific message for AI1
const AI2_SYSTEM_MESSAGE = "AI2 system message."; // Context-specific message for AI2
const COMMON_SYSTEM_MESSAGE = "Something for both."; // Shared context message for both AIs
 // Define how many rounds the AIs will talk to each other
const rounds = 13;

// Generate random greetings for AI2's initial message. Make more for better dialogues.
function generateRandomStartGreetingFromAI2() {
  const greetings = ["Hey babe!", "Hi AI1."];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// Generate random topics for AI2 to start with. Generate more as you like.
function generateRandomStartTopicFromAI2() {
  const topics = ["Do you like chocolate", "What is reason for wars?"];
  return topics[Math.floor(Math.random() * topics.length)];
}

// Combine greeting and topic to create AI2's opening message
const openingLine = generateRandomStartGreetingFromAI2() + generateRandomStartTopicFromAI2();

// Function to simulate a conversation between two AIs
async function autonomousChat() {
  // Chat configuration (adjust as needed)
  let chatData = {
    model: "gpt-4o-mini", // Specify the GPT model
    messages: [], // Stores the conversation history
    temperature: 1, // Controls response randomness (1 = more random)
    max_tokens: 1024 * 8, // Maximum token limit for responses
    top_p: 1, // Controls diversity (1 = maximum diversity)
    frequency_penalty: 0, // Penalizes frequent token usage
    presence_penalty: 0, // Encourages AI to introduce new ideas
  };

  // Initialize conversation with AI2's first message
  chatData.messages.push({
    role: "user", // AI2 starts the conversation as the "user"
    content: openingLine,
  });
  console.log("AI2 starts with:", openingLine);

  try {
    for (let i = 0; i < rounds; i++) {
      // Determine the system message based on whose turn it is
      // Alternate between AI1 and AI2 system messages
      let systemMessage = i % 2 === 0 ? AI1_SYSTEM_MESSAGE : AI2_SYSTEM_MESSAGE;

      // Clear any existing system messages in the conversation history
      chatData.messages = chatData.messages.filter((msg) => msg.role !== "system");

      // Append current conversation state to log file for debugging
      fs.appendFileSync("log.json", `\n\n---\n${JSON.stringify(chatData, null, 2)}\n\n`);

      // Add a new system message to set context for the next response
      chatData.messages.push({
        role: "system",
        content: `${COMMON_SYSTEM_MESSAGE} ${systemMessage}`, // Combine common and specific system messages
      });

      // Send the current conversation to OpenAI to get a response
      const response = await openai.chat.completions.create(chatData);

      // Extract AI's response from the API response
      const aiResponse = response.choices[0].message.content;
      console.log(`Response (${i % 2 === 0 ? "AI1:" : "AI2"}):`, "\n", aiResponse, "\n\n");

      // Add AI's response to the conversation history
      chatData.messages.push({
        role: "assistant", // AI's response is always from the "assistant"
        content: aiResponse,
      });

      // Swap roles for the next turn
      // AI1 should see itself as "assistant" and AI2's messages as "user" (and vice versa)
      chatData.messages = chatData.messages.map((msg) =>
        msg.role === "user"
          ? { ...msg, role: "assistant" } // Change "user" messages to "assistant"
          : msg.role === "assistant"
          ? { ...msg, role: "user" } // Change "assistant" messages to "user"
          : msg // Leave system messages unchanged
      );
    }

    // Optional: Log final conversation state for debugging
    // console.log("\n\n\n", JSON.stringify(chatData, null, 2));
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the autonomous chat simulation
autonomousChat();

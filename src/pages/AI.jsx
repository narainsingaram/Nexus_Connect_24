import React, { useState } from "react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const AI = () => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [originalUserInput, setOriginalUserInput] = useState(""); // Store original user input separately

  const generateResponse = async () => {
    setLoading(true);
    setOriginalUserInput(userInput); // Store original user input before generating response

    const MODEL_NAME = "gemini-pro";
    const API_KEY = "AIzaSyDRlUUReWOBg7x237Y5WtC0bOyBhyMSrUw"; // Replace with your actual API key

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const parts = [
      { text: "Kyle, as an AI developed specifically to assist CTAE (Career, Technical, and Agricultural Education) individuals in schools, my primary function is to provide accurate and relevant information regarding business and community organizations pertinent to your field of study. I'm equipped to offer concise yet informative responses tailored to CTAE topics. However, I'm also programmed to engage in conversation beyond CTAE-related matters. If you have any inquiries or require assistance outside the scope of CTAE, feel free to ask, and I'll do my best to help while ensuring the information provided is accurate and beneficial to you (MAX WORD COUNT IS 300 WORDS)" },
      { text: userInput }
    ];

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      // Format the generated content with HTML markup
      const generatedText = response.text()
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Wrap text between double asterisks with <strong> tags

      // Add the user's input to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        {
          id: Date.now(), // Unique identifier for each chat item
          role: 'user',
          time: getCurrentTime(),
          text: userInput,
        },
        {
          id: Date.now() + 1,
          role: 'bot',
          time: getCurrentTime(),
          text: generatedText.replace(/\n/g, "<br>"), // Convert newlines to HTML line breaks
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return `${hours}:${minutes}`;
  };

  return (
    <div className="relative h-screen">
      <div className="py-10 lg:py-14">
        {/* Title */}
        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
            Welcome to <strong className="bg-blue-400 rounded-xl px-4 py-2">Kyle AI</strong>
          </h1>
          <p className="mt-3 text-gray-600">
            Your <strong>AI-powered copilot</strong> for the web
          </p>
        </div>
        {/* End Title */}

        {/* Chat Content */}
        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto mt-8 space-y-8">
          <div className="relative fixed bottom-0 left-0 w-full">
            <div className="mt-10 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  type="text"
                  className="p-4 w-full border-2 border-slate-200 rounded-full text-sm focus:border-blue-200"
                  placeholder="Ask me anything..."
                />
                <div className="absolute top-1/2 end-2 -translate-y-1/2">
                  <button
                    onClick={generateResponse}
                    type="button"
                    className="w-10 h-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover:text-gray-800 bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={loading}
                  >
                    <svg
                      className="w-5 h-5 text-slate-600 hover:text-slate-800"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="max-w-sm animate-pulse">
              <div role="status" className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[360px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[330px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[300px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[360px]"></div>
              <span className="sr-only">Loading...</span>
            </div>
          )}

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="space-y-4">
              {chatHistory.map((chatItem) => (
                <div
                  key={chatItem.id}
                  className={`chat-item ${chatItem.role === "bot" ? "chat-start" : "chat-end"}`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        width="30"
                        height="30"
                        className="bg-slate-100"
                        alt={chatItem.role === "bot" ? "Bot Avatar" : "User Avatar"}
                        src={
                          chatItem.role === "bot"
                            ? "https://img.freepik.com/premium-photo/3d-style-chat-bot-robot-ai-app-icon-isolated-color-background-generative-ai_159242-25913.jpg"
                            : "https://cdn1.iconfinder.com/data/icons/facely-metapeople-3d-avatar-set/512/17._Designer.png"
                        }
                      />
                    </div>
                  </div>
                  <div className="chat-header">
                    {chatItem.role === "bot" ? "Kyle" : "User"}
                    <time className="text-xs opacity-50">{chatItem.time}</time>
                  </div>
                  <div
                    className="bg-slate-100 border border-gray-200 rounded-2xl p-3 space-y-2"
                    dangerouslySetInnerHTML={{ __html: chatItem.text }}
                  ></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AI;

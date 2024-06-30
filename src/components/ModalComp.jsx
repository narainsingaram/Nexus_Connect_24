import React, { useState } from 'react';
import { Badge } from 'primereact/badge';
import { Edit } from 'iconsax-react';
import { GoogleGenerativeAI } from "@google/generative-ai";


const ModalComp = ({ open, setOpen, img, name, info, email, contact, id, handleDelete }) => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");

    const generateSummary = async () => {
        setLoading(true);
        // Replace with your actual API key and model name
        const MODEL_NAME = "gemini-pro";
        const API_KEY = "AIzaSyDRlUUReWOBg7x237Y5WtC0bOyBhyMSrUw";

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        };

        const parts = [
            { text: `Based on the following details, provide as much information as possible about the business/organization in a clear format that is extremely informational:\n\nName: ${name}\nInfo: ${info}\nEmail: ${email}\nContact: ${contact}` }
        ];

        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });

            const response = result.response;
            const generatedSummary = response.text()
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            setSummary(generatedSummary);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${open ? 'block' : 'hidden'} fixed z-10 inset-0 overflow-y-auto`}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="">
                        <img className="" src={img} alt="Workflow" /> 
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="!text-4xl font-medium leading-6 mt-2 text-gray-900">{name}</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">{email}</p>
                                    <p className="text-sm text-gray-500">{info}</p>
                                    <p className="text-sm text-gray-500">{contact}</p>
                                </div>
                                {summary && (
                                    <div className="bg-gradient-to-r from-red-400 to-yellow-500 p-3 mt-4 rounded-lg text-white">
                                        <h4 className="text-lg font-medium">AI-Generated Summary</h4>
                                        <p dangerouslySetInnerHTML={{ __html: summary }}></p>
                                        <Badge value="AI" severity="warning"></Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="btn btn-primary mx-2"
                            onClick={() => generateSummary()}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Summarize'}
                        </button>
                        <div></div>
                        <button
                            type="button"
                            className="btn btn-danger mx-2"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalComp;

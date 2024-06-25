import React, { useState } from 'react';
import { Button, Modal, Header, Image } from 'semantic-ui-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Badge } from 'primereact/badge';
// import NoteForm from './NoteForm';
// import NotesList from './NotesList';


const ModalComp = ({ open, setOpen, img, name, info, email, contact, id, handleDelete }) => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");

    const generateSummary = async () => {
        setLoading(true);
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

        const parts = [
            { text: `Based on the following details, provide as much information as possible about the business/organization in a clear format that is extremely informational:\n\nName: ${name}\nInfo: ${info}\nEmail: ${email}\nContact: ${contact}` }
        ];

        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });

            const response = result.response;
            // Extract the summary from the response
            const generatedSummary = response.text()
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Wrap text between double asterisks with <strong> tags

            setSummary(generatedSummary);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}>
            <Modal.Header>Business Details</Modal.Header>
            <Modal.Content image>
                <Image size="medium" src={img} wrapped />
                <Modal.Description>
                    <Header>{name}</Header>
                    <p>{email}</p>
                    <p>{info}</p>
                    <p>{contact}</p>
                    {/* <NotesList partnerId={partner.id} />
                    <NoteForm partnerId={partner.id} /> */}
                    {summary && (
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
                                padding: '15px',
                                borderRadius: '20px',
                                marginTop: '15px',
                                color: 'white',
                            }}
                        >
                            <Header className='p-overlay-badge' as="h4" style={{ color: 'white' }}>AI-Generated Summary</Header>
                            <p dangerouslySetInnerHTML={{ __html: summary }}></p>
                            <Badge value="AI" severity="warning"></Badge>
                        </div>
                    )}
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button
                    color="blue"
                    content="Summarize"
                    labelPosition="right"
                    icon="lightbulb"
                    onClick={generateSummary}
                    loading={loading}
                    disabled={loading}
                />
                <Button
                    color="red"
                    content="Delete"
                    labelPosition="right"
                    icon="checkmark"
                    onClick={() => handleDelete(id)}
                />
            </Modal.Actions>
        </Modal>
    )
}

export default ModalComp;

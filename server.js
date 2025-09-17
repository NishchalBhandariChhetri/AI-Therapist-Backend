import express from 'express';
import fetch from 'node-fetch'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Change to use OpenRouter key
if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY is not set in .env file. Please add it.');
  process.exit(1);
}

console.log(
  '✅ OPENROUTER_API_KEY loaded successfully (first 10 chars):',
  process.env.OPENROUTER_API_KEY.substring(0, 10) + '...'
);

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage || userMessage.trim() === '') {
      return res.status(400).json({ reply: 'Please enter a message.' });
    }

    console.log('📩 Received message:', userMessage);

    const authHeader = `Bearer ${process.env.OPENROUTER_API_KEY}`;
    console.log('🔑 Authorization header (first 20 chars):', authHeader.substring(0, 20) + '...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free', // <-- Use OpenRouter model id
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ OpenRouter API Error [${response.status}]:`, text);
      return res.status(response.status).json({ reply: `API error (${response.status}): ${text}` });
    }

    const data = await response.json();
    console.log('✅ OpenRouter API Response:', data);

    let botReply = 'Sorry, I could not generate a response.';
    if (data.choices && data.choices.length > 0 && data.choices[0]?.message?.content) {
      botReply = data.choices[0].message.content.trim();
    }

    res.json({ reply: botReply });
  } catch (error) {
    console.error('🔥 Server error:', error);
    res.status(500).json({
      reply: 'Internal server error. Please try again later.',
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

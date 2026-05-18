// server.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Servir arquivos estáticos (seu index.html, CSS, JS) na pasta "public"
app.use(express.static('public'));

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// Rota para mensagens do cliente (simulação de conversa)
app.post('/chat', async (req, res) => {
  try {
    const { messages, temperature = 0.85, max_tokens = 300, top_p = 0.9 } = req.body;

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens,
        top_p
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      console.error('Erro Groq /chat:', err);
      return res.status(500).json({ error: 'Erro na API Groq (chat)' });
    }

    const data = await groqRes.json();
    res.json(data);
  } catch (e) {
    console.error('Erro interno /chat:', e);
    res.status(500).json({ error: 'Erro interno no servidor (chat)' });
  }
});

// Rota para avaliação final (mesma API Groq, só mudam mensagens e parâmetros)
app.post('/eval', async (req, res) => {
  try {
    const { messages, temperature = 0.2, max_tokens = 800 } = req.body;

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      console.error('Erro Groq /eval:', err);
      return res.status(500).json({ error: 'Erro na API Groq (eval)' });
    }

    const data = await groqRes.json();
    res.json(data);
  } catch (e) {
    console.error('Erro interno /eval:', e);
    res.status(500).json({ error: 'Erro interno no servidor (eval)' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
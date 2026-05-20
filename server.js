import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'node:url';

// ===================== AJUSTES DE PATH NO ESM =====================
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ===================== CONFIG BÁSICA =====================
const app = express();

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant'; // ou o modelo que você já usava

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===================== ROTA /chat (CLIENTE SIMULADO) =====================
app.post('/chat', async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 120 } = req.body;

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
      console.error('Erro Groq /chat (HTTP != 200):', err);
      return res.status(500).json({
        error: 'Erro na API Groq (chat)',
        details: err
      });
    }

    const data = await groqRes.json();
    return res.json(data);

  } catch (e) {
    console.error('Erro interno /chat:', e);
    return res.status(500).json({
      error: 'Erro interno no servidor (chat)',
      details: e.message || String(e)
    });
  }
});

// ===================== ROTA /eval (AVALIAÇÃO) =====================
app.post('/eval', async (req, res) => {
  try {
    const { messages, temperature = 0.2, max_tokens = 500 } = req.body;

    console.log('[/eval] Recebendo avaliação com', messages?.length || 0, 'mensagens');

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
      console.error('Erro Groq /eval (HTTP != 200):', err);
      return res.status(500).json({
        error: 'Erro na API Groq (eval)',
        details: err
      });
    }

    const data = await groqRes.json();
    return res.json(data);

  } catch (e) {
    console.error('Erro interno /eval:', e);
    return res.status(500).json({
      error: 'Erro interno no servidor (eval)',
      details: e.message || String(e)
    });
  }
});

// ===================== SUBIR SERVIDOR =====================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('====================================');
  console.log(`Servidor rodando na porta ${port}`);
  console.log('Acesse: http://localhost:' + port);
  console.log('====================================');
});
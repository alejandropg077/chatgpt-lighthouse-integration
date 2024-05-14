const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const openaiApiKey = 'sk-proj-v6GSev3ZtUixjDbvku5AT3BlbkFJSORfGzugv7vweHHavrOF';

const lighthouseFunctionUrl = 'https://europe-southwest1-olivia-423219.cloudfunctions.net/LighthouseFunction';

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).send('Prompt is required');
    return;
  }

  try {
    // Llamar a la API de OpenAI para obtener la respuesta de ChatGPT
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo', // Ajusta el modelo según sea necesario
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const chatResponse = openaiResponse.data.choices[0].message.content;

    // Extraer la URL de la respuesta de ChatGPT (si existe)
    const urlMatch = chatResponse.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const url = urlMatch[0];

      // Llamar a la función de Lighthouse con la URL
      const lighthouseResponse = await axios.get(`${lighthouseFunctionUrl}?url=${url}`);
      const lighthouseData = lighthouseResponse.data;

      res.status(200).send({
        chatResponse,
        lighthouseData
      });
    } else {
      res.status(200).send({
        chatResponse,
        lighthouseData: null
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

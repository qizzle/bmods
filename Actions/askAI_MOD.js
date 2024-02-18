/*
  Ask AI mod by qschnitzel
  Licensed under MIT License

  Prompt an AI. Yeah thats it.
*/

module.exports = {
  data: {
    name: "Ask AI",
  },
  UI: [
    {
      element: "input",
      storeAs: "url",
      name: "API URL",
    },
    "-",
    {
      element: "input",
      storeAs: "key",
      name: "API Key",
    },
    "-",
    {
      element: "input",
      storeAs: "model",
      name: "Model",
    },
    "-",
    {
      element: "input",
      storeAs: "prompt",
      name: "Prompt",
    },
    "-",
    {
      element: "input",
      storeAs: "systemPrompt",
      name: "System Prompt",
    },
    "-",
    {
      element: "input",
      storeAs: "tokenLimit",
      name: "Token Limit",
    },
    "-",
    {
      element: "input",
      storeAs: "exceededMessage",
      name: "Message if Token Limit is exceeded",
    },
    "-",
    {
      element: "storageInput",
      storeAs: "store",
      name: "Store response",
    },
  ],

  async run(values, interaction, client, bridge) {
    const url = bridge.transf(values.url);
    const key = bridge.transf(values.key);
    const model = bridge.transf(values.model);
    const prompt = bridge.transf(values.prompt);
    const systemPrompt = bridge.transf(values.systemPrompt);
    const tokenLimit = bridge.transf(values.tokenLimit);
    const exceededMessage = bridge.transf(values.exceededMessage);

    if (estimateTokenCount(prompt) >= tokenLimit) {
      return bridge.store(values.store, exceededMessage);
    }

    const body = {
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    const convertedResponse = await response.json();

    if (!response.ok) {
      console.log(
        "Response resulted in a error. Please check error and look for any typos in configuration!",
        response.status,
        response.statusText,
        "\n",
        response
      );
      return bridge.store(
        values.store,
        "Error with Chat Completion, please message the bot author!"
      );
    }

    bridge.store(values.store, convertedResponse.choices[0].message.content);
  },
};

const estimateTokenCount = (string, approximationLoss = 3) => {
  return Math.ceil(string.length / 5) + approximationLoss;
};
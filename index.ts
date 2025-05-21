import * as dotenv from "dotenv";
import { OpenAI } from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/src/resources/index.js";
import { getUserInfo } from "./user";
import { getWeatherInfo } from "./weather";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_user_info",
      description:
        "Retrieves user information including fullname, nickname, email, age, languages, origin, current location and current datetime",
      strict: false,
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather_info",
      description:
        "Fetches the current weather based on the provided latitude and longitude of the location.",
      strict: true,
      parameters: {
        type: "object",
        required: ["latitude", "longitude"],
        properties: {
          latitude: {
            type: "number",
            description: "Geographical latitude of the location",
          },
          longitude: {
            type: "number",
            description: "Geographical longitude of the location",
          },
        },
        additionalProperties: false,
      },
    },
  },
];

const toolHandlers: {
  [key: string]: (...args: any) => Promise<any>;
} = {
  get_user_info: getUserInfo,
  get_weather_info: getWeatherInfo,
};

async function runAssistant() {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a personal day-to-day assistant, created to help me manage my agenda and answer me with helpful information. Always be conscise and clear, but also sympathetic.",
    },
    {
      role: "user",
      content: "What’s the weather like where I am?",
    },
  ];

  let response = await openai.chat.completions.create({
    model: "gpt-4-0613",
    messages,
    tools: tools,
    tool_choice: "auto",
  });

  while (response.choices[0].finish_reason === "tool_calls") {
    const toolCalls = response.choices[0].message.tool_calls;

    console.log("Tool calls:", toolCalls);

    const toolResponses: ChatCompletionMessageParam[] = [];

    for (const call of toolCalls!) {
      const { name, arguments: argsJSON } = call.function;
      const args = JSON.parse(argsJSON);

      console.log(`Calling tool: ${name} with args:`, args);

      const result = await toolHandlers[
        name as "get_user_info" | "get_current_weather"
      ](args);

      console.log(`Tool ${name} returned:`, result);

      toolResponses.push({
        tool_call_id: call.id,
        role: "tool",
        content: JSON.stringify(result),
      });
    }

    messages.push(response.choices[0].message, ...toolResponses);

    response = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages,
      tools: tools,
    });
  }

  console.log("Assistant says:", response.choices[0].message.content);
}

runAssistant();

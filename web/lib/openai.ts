import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_URL || "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "https://yhw.tw/anonqa-ghrepo",
    "X-Title": "anonqa",
  },
});

export default openai;

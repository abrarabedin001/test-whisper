import { createClient } from "@deepgram/sdk";
import OpenAI from "openai";

const emojis = ["👨‍🦱", "😺"];

const prompt = `You will be given a transcript of a conversation. There is exactly two people talking. Identify the speakers from the context of what they are speaking and use ${emojis[1]} to represent one of the speakers and ${emojis[0]} to represent the other. Remember the context that they are speaking and use that to identify the speakers. Use the same emojis for each speaker for the full conversation. Now generate a summary of the conversation as one single paragraph, assigning each speaker with their respective emojis.`;

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: prompt,
  },
];

const transcribes: string[] = [];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const transcribeAudio = async (params: { url: string }) => {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: params.url,
      },
      // STEP 3: Configure Deepgram options for audio analysis
      {
        model: "nova-2",
        smart_format: true,
      }
    );

    if (error) throw error;

    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4-turbo-preview",
    });

    // pushing the asisstant prompt

    messages.push({
      role: "assistant",
      content: completion.choices[0].message.content,
    });

    console.log(messages);


    let sentencesArray = [] as { text: string, start: number, end: number }[];
    result.results.channels[0].alternatives[0].paragraphs?.paragraphs.forEach((paragraph: { sentences: any[] }) => {
      paragraph.sentences.forEach(async (sentence: any) => {
        console.log("sentence awesome:  ", sentence);
        sentencesArray.push(sentence)
      })
    });

    return {
      transcribes:
        sentencesArray,
      gpt_res: completion.choices[0].message.content,
    };

    return null;
    // return result.results.channels[0].alternatives[0];
  } catch (error) { }
};

export const getNextSteps = async (data: { convo: string }) => {
  if (!data.convo) {
    throw new Error("No conversation provided");
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `The following is a summary of a transcript that you generated for a conversation. AscendAi is an introvert so he may not know how to continue the conversation from here. Now provide an explaination to the speaker about what he should talk about next.`,
        },
        {
          role: "user",
          content: data.convo,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0].message);

    return {
      suggestion: completion.choices[0].message.content,
    };
  } catch (error) { }
};

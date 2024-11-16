import {
  ChatMessage,
  CompletionOptions,
  CustomHttpService,
  ModelProvider,
} from "../../index.js";
import { BaseLLM } from "../index.js";

class CustomHttpServiceClass extends BaseLLM {
  get providerName(): ModelProvider {
    return "customHttpService";
  }

  private endpoint: string;

  private customStreamCompletion?: (
    prompt: string,
    options: CompletionOptions,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  ) => AsyncGenerator<string>;

  async *customStreamChat (
    input: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {}

  constructor(custom: CustomHttpService) {
    super(custom.options || { model: "customHttpService" });
    this.endpoint = custom.endpoint;
    this.templateMessages = (messages: ChatMessage[]): string => {
      const res = messages
       .map((message) => message.content)
       .join("\n");
      return res;
    }
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    throw new Error("not implemented");
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    const response = await this.fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": "kaiyuy/leandojo-lean4-tacgen-byt5-small",
        "prefix": "",
        "input": prompt,
      }),
    });
    const res = await response.json() as {
      outputs: Array<{
        output: string;
        score: number;
      }>
    };
    const sortedScoreOutput = res.outputs.sort((a, b) => b.score - a.score);

    const bestScore = sortedScoreOutput.map(({output}) => `${output};`);
    for (const output of bestScore) {
      yield output;
    }
  }
}

export default CustomHttpServiceClass;

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
  ): AsyncGenerator<string> {
    const response = await this.fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": "kaiyuy/leandojo-lean4-tacgen-byt5-small",
        "prefix": "",
        "input": "(a b c : Nat) : a + b + c = a + c + b",
      }),
    });
    const res = await response.text();
    console.error(res);
    yield res;
  }

  constructor(custom: CustomHttpService) {
    super(custom.options || { model: "customHttpService" });
    this.endpoint = custom.endpoint;
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
    for await (const content of this.customStreamChat(
        prompt,
        options,
    )) {
      yield content;
    }
  }
}

export default CustomHttpServiceClass;

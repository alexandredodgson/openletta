import { expect, test, describe } from "bun:test";
import { aggregateMessages } from "../src/utils/letta";
import type { LettaMessage } from "../src/types/letta";

describe("aggregateMessages", () => {
  test("should aggregate user and assistant messages", () => {
    const messages: LettaMessage[] = [
      { message_type: "user_message", content: "Hello" },
      { message_type: "reasoning_message", content: "Thinking..." },
      { message_type: "assistant_message", content: "Hi" },
      { message_type: "assistant_message", content: " there!" },
    ];

    const result = aggregateMessages(messages);

    expect(result).toHaveLength(2);
    expect(result[0].role).toBe("user");
    expect(result[0].content).toBe("Hello");
    expect(result[1].role).toBe("assistant");
    expect(result[1].content).toBe("Hi there!");
    expect(result[1].reasoning).toEqual(["Thinking..."]);
  });

  test("should handle tool calls and returns", () => {
    const messages: LettaMessage[] = [
      { message_type: "user_message", content: "Run bash" },
      {
        message_type: "approval_request_message",
        tool_call: { tool_call_id: "1", tool_name: "bash", arguments: { command: "ls" } }
      },
      {
        message_type: "tool_return_message",
        tool_call_id: "1",
        tool_name: "bash",
        status: "success",
        result: "file.txt"
      },
    ];

    const result = aggregateMessages(messages);

    expect(result).toHaveLength(2);
    expect(result[1].toolCalls).toHaveLength(1);
    expect(result[1].toolReturns).toHaveLength(1);
    expect(result[1].toolCalls![0].tool_name).toBe("bash");
    expect(result[1].toolReturns![0].result).toBe("file.txt");
  });
});

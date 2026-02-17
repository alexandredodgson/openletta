import type { LettaMessage, DisplayMessage } from '../types/letta.js';

export function aggregateMessages(messages: LettaMessage[]): DisplayMessage[] {
  const displayMessages: DisplayMessage[] = [];
  let currentAssistant: DisplayMessage | null = null;

  for (const msg of messages) {
    if (msg.message_type === 'user_message') {
      currentAssistant = null;
      displayMessages.push({
        role: 'user',
        content: msg.content,
      });
    } else if (
      msg.message_type === 'assistant_message' ||
      msg.message_type === 'reasoning_message' ||
      msg.message_type === 'approval_request_message' ||
      msg.message_type === 'tool_return_message'
    ) {
      if (!currentAssistant) {
        currentAssistant = {
          role: 'assistant',
          content: '',
          reasoning: [],
          toolCalls: [],
          toolReturns: [],
        };
        displayMessages.push(currentAssistant);
      }

      if (msg.message_type === 'assistant_message') {
        currentAssistant.content += msg.content;
      } else if (msg.message_type === 'reasoning_message') {
        currentAssistant.reasoning?.push(msg.content);
      } else if (msg.message_type === 'approval_request_message') {
        currentAssistant.toolCalls?.push(msg.tool_call);
      } else if (msg.message_type === 'tool_return_message') {
        currentAssistant.toolReturns?.push(msg);
      }
    }
  }

  // Clean up empty arrays
  return displayMessages.map(m => ({
    ...m,
    reasoning: m.reasoning?.length ? m.reasoning : undefined,
    toolCalls: m.toolCalls?.length ? m.toolCalls : undefined,
    toolReturns: m.toolReturns?.length ? m.toolReturns : undefined,
  }));
}

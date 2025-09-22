import { Injectable, Logger } from '@nestjs/common';
import SimpleCompletionAssistant from 'src/handlers/gen-ai/SimpleCompletionAssistant';

@Injectable()
export class ThayaTextComposerService {
    private readonly logger: Logger = new Logger('ThayaTextComposerService');

    async composeRoutineMessage(
        userName: string,
        evaluatedPeriod: string,
        agendaItems: { datetime: string; description: string }[],
    ): Promise<string> {
        this.logger.debug(
            `Composing routine message for userName: ${userName} for period: ${evaluatedPeriod} with ${agendaItems.length} agenda items`,
        );

        if (agendaItems.length === 0) {
            this.logger.warn(
                `No agenda items provided for userName: ${userName}. Returning empty message.`,
            );
            return `Hello ${userName}, you have no agenda items for the period of ${evaluatedPeriod}. Enjoy your day! 🎉`;
        }

        this.logger.debug(
            `Agenda items: ${JSON.stringify(agendaItems, null, 2)}`,
        );

        const setupMessage = `
  You are Thaya, an assistant created to compose messages containing the items in the user's agenda for the given period, thus helping the user to remember their commitments. Always be concise and clear, but also sympathetic.
  Your messages will be sent via Telegram, so enrich your answers with emojis, but never use Markdown.
  If formatting is needed, you have following options available:
      <b>bold</b>
  
      <i>italic</i>
  
      <u>underline</u>
  
      <s>strikethrough</s>
  
      <a href="https://www.someurl.com">Link</a>
  
      <code>inline code</code>
      <pre>
      multiline
      code block
      </pre>
  Be structured, quickly readable and visually intuititive.
  `.trim();

        const assistant = new SimpleCompletionAssistant(setupMessage);

        const formattedAgendaItems = agendaItems
            .map((item) => `- ${item.datetime} | ${item.description}`)
            .join('\n');

        const completion = await assistant.createCompletion(
            `User ${userName} has the following events/reminder for the evaluated period of ${evaluatedPeriod}:\n${formattedAgendaItems}\n\nMake sure to compose a friendly message that will be sent.`,
        );

        return completion;
    }

    async composePatientRecordSummary(
        patientName: string,
        patientRecordContent: string,
    ): Promise<string> {
        this.logger.debug(
            `Composing patient record summary for patientName: ${patientName}`,
        );

        if (!patientRecordContent || patientRecordContent.trim().length === 0) {
            this.logger.warn(
                `No patient record content provided for patientName: ${patientName}. Returning empty summary.`,
            );
            return `No content available to generate a summary.`;
        }

        const setupMessage = `
  You are Thaya, an assistant created to help doctors by summarizing patient records into concise and clear summaries that can be easily reviewed later. Always be concise and clear, but also professional.
  Use medical terminology when appropriate, but ensure the summary is understandable for general medical professionals. Avoid overly complex language.
  It must be a single paragraph summary with no bullet points, lists or titles. Maximum of 200 characters.
  `.trim();

        const assistant = new SimpleCompletionAssistant(setupMessage);

        const completion = await assistant.createCompletion(
            `Patient name is ${patientName}. Here is the content of the patient's record:\n${patientRecordContent}\n\nMake sure to compose a summary that is concise and clear.`,
        );

        return completion;
    }
}

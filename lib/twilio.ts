import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Returns true if all required Twilio environment variables are set.
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && fromNumber);
}

/**
 * Sends an SMS via the Twilio REST API directly.
 * Throws if Twilio credentials are not configured.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
  }

  const client = twilio(accountSid, authToken);
  await client.messages.create({ body, from: fromNumber, to });
}

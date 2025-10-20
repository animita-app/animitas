import { Twilio } from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !fromPhoneNumber) {
  throw new Error('Missing Twilio credentials in environment variables')
}

export const twilioClient = new Twilio(accountSid, authToken)

export const sendVerificationSMS = async (
  phoneNumber: string,
  code: string
) => {
  try {
    const message = await twilioClient.messages.create({
      body: `Tu código para Ánima es ${code}.`,
      from: fromPhoneNumber,
      to: phoneNumber,
    })

    return {
      success: true,
      sid: message.sid,
      status: message.status,
    }
  } catch (error) {
    console.error('Error sending verification SMS:', error)
    throw error
  }
}

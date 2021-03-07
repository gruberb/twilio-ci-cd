exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const client = context.getTwilioClient();

  if (event.SequenceNumber == 2) {
    await client.conferences(event.ConferenceSid)
      .update({announceUrl: `https://handler.twilio.com/twiml/${process.env.TWIML_WHISPER}`})
      .then(conference => console.log(conference.friendlyName));
  }

  response.setBody({
    status: 200
  });

  return callback(null, response);
};
import {WebClient} from '@slack/client';

const slack_token = process.env.SLACK_TOKEN;

export function handler(event, context, callback) {
  const slack = new WebClient(slack_token);

  return slack.users.list().then(usersResult => {
    const error = null;
    const response = {
      statusCode: 200,
      body: JSON.stringify({users: usersResult.members}),
    };

    return callback(error, response);
  }, console.error);
}

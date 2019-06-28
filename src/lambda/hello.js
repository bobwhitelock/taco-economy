import MongoClient from 'mongodb';

const mongodb_uri = process.env.MONGODB_URI;

export function handler(event, context, callback) {
  return MongoClient.connect(mongodb_uri, function(err, client) {
    if (err) {
      throw err;
    }

    client
      .db()
      .collection('tacos')
      .find({})
      .toArray()
      .then(tacos => {
        const error = null;
        const response = {
          statusCode: 200,
          body: JSON.stringify({tacos}),
        };

        return callback(error, response);
      }, console.error);
  });
}

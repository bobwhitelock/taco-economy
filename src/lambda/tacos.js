import MongoClient from 'mongodb';

const mongodb_uri = process.env.MONGODB_URI;

export function handler(event, context, callback) {
  // eslint-disable-next-line no-console
  // console.log('context [ucasneys]:', context);
  // eslint-disable-next-line no-console
  // console.log('event [idvamozh]:', event);
  return MongoClient.connect(mongodb_uri, function(err, client) {
    // eslint-disable-next-line no-console
    // console.error('mongodb_uri [gklzwgxp]:', mongodb_uri);
    if (err) {
      // eslint-disable-next-line no-console
      // console.error('err [byehqpwu]:', err);
      throw err;
    }

    client
      .db()
      .collection('tacos')
      .find({})
      .toArray()
      .then(tacos => {
        // eslint-disable-next-line no-console
        console.error('tacos [kesdsrvh]:', tacos);
        const error = null;
        const response = {
          statusCode: 200,
          body: JSON.stringify({tacos}),
        };

        return callback(error, response);
      }, console.error);
  });
}

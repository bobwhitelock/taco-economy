import MongoClient from 'mongodb';

const mongodb_uri = process.env.MONGODB_URI;

process.on('unhandledRejection', err => {
  console.error('ERROR: ' + err);
  console.trace();
  process.exit(1);
});

export async function handler(event, context, callback) {
  // eslint-disable-next-line no-console
  // console.log('context [ucasneys]:', context);
  // eslint-disable-next-line no-console
  // console.log('event [idvamozh]:', event);
  try {
    return MongoClient.connect(mongodb_uri, async function(err, client) {
      try {
        if (err) {
          throw err;
        }

        const tacos = await client
          .db()
          .collection('tacos')
          .find({})
          .toArray();

        const error = null;
        const response = {
          statusCode: 200,
          body: JSON.stringify({tacos}),
        };

        return callback(error, response);
      } catch (err) {
        console.error(`ERROR 1: ${err}`);
        return callback(err, {statusCode: 500, body: '{}'});
      }
    });
  } catch (err) {
    console.error(`ERROR 2: ${err}`);
    return callback(err, {statusCode: 500, body: '{}'});
  }
}

import * as functions from 'firebase-functions/v1';

import app from '../app';
import { initializeFirebaseApp } from '../lib/firebaseAdmin';
import { runPersonaExpirationJob } from '../jobs/personaExpirationJob';

initializeFirebaseApp();

export const api = functions.https.onRequest(app);

export const scheduledPersonaMonitor = functions.pubsub.schedule('every 6 hours').onRun(async () => {
  await runPersonaExpirationJob();
});

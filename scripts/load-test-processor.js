module.exports = {
  setEventType: setEventType,
  setBatchEvents: setBatchEvents
};

function setEventType(context, events, done) {
  const eventTypes = ['page_view', 'click', 'scroll', 'form_submit', 'button_click'];
  context.vars.eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  return done();
}

function setBatchEvents(context, events, done) {
  const batchSize = Math.floor(Math.random() * 10) + 1;
  const events = [];
  
  for (let i = 0; i < batchSize; i++) {
    events.push({
      eventType: 'batch_test',
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
      url: `https://example.com/page${i}`,
      metadata: { batch: true, index: i }
    });
  }
  
  context.vars.batchEvents = events;
  return done();
}

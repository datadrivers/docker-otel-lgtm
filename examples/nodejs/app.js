const { trace, SpanStatusCode } = require('@opentelemetry/api')
const express = require('express')
const { rollTheDice } = require('./dice.js')
const { Logger } = require('./logger.js')
const { faker } = require('@faker-js/faker')

const tracer = trace.getTracer('dice-server', '0.1.0')

const logger = new Logger('dice-server')

const PORT = parseInt(process.env.PORT || '8084')
const app = express()

app.get('/rolldice', (req, res) => {
  return tracer.startActiveSpan('rollDice', (span) => {
    const randomName = faker.person.fullName();
    const randomEmail = faker.internet.email();
    const randomUUID = faker.string.uuid();
    const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN
    logger.log('Received request to dice ' + rolls + ' rolls for UUID ' + randomUUID)
    if (isNaN(rolls)) {
      const errorMessage =
        "Request parameter 'rolls' is missing or not a number."
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: errorMessage
      })
      logger.error(errorMessage)
      res.status(400).send(errorMessage)
      span.end()
      return
    }
    const result = JSON.stringify([rollTheDice(rolls, 1, 6), randomUUID, randomName, randomEmail])
    span.end()
    res.send(result)
  })
})

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`)
})

# Credal Quickstart

This is some code that will make it easy to get started using the [Credal.AI platform](https://app.credal.ai/signin).

## Getting Started

**You will need:**

1. A computer running macOS/Linux
2. Node.js >= v16.0.0

## Installation

First up, clone this repo to your system, and then `cd` into the `credal-demo` directory. Next, install the dependencies with `npm install`. Finally, you can start the HTTP server that will accept requests and forward them to GPT-4 via Credal with `npm run start`.

## Usage

Once you've started the server, there are three endpoints that you can use to start a session and interact with GPT-4.

They are `GET /new-session`, `POST /send/<SESSION_UUID>`, and `POST /delete-session/SESSION_UUID`.

In this application, a "session" will keep track of the conversation you've had so far with GPT. By sending a message via the `/send/<SESSION_UUID>` endpoint, the message sent will be stored in-memory on the server and included (along with responses from GPT) (in order) in susbequent requests to the service. This enables GPT to have context of the whole conversation, rather than handling each message on an individual basis.

### Environment Variables

This application uses the Credal API key stored in the environment variables of the system it is operating on. You can set environment variables on the system, or if running locally, you can create a `.env` file in the root of your working folder to contain the environment variables you would like your application to use.

The API key for Credal will be accessed from the `CREDAL_API_KEY` environment variable.

### Obtaining a Credal API Key

To obtain an API key for Credal, you can follow the instructions in [the API_KEY.md](./API_KEY.md) file.

### Creating a session

To get started, first make a `GET` request to the `/new-session`. This will return a JSON object with the following structure:

```json
{
    "status": "ok",
    "data": "9d6e0981-afde-4596-84d4-6ade613dfbbd"
}
```

The `data` property will contain the `<SESSION_UUID>` that you can pass to the `/send/<SESSION_UUID>` endpoint when submitting later messages.

### Sending a message

To send a message for a conversation, you can hit the `POST /send/<SESSION_UUID>` endpoint with a payload like this...

```json
{
    "message" : "Hello, there!"
}
```

...to which, you'll receive a response from GPT via Credal and your application:

```json
{
    "status": "ok",
    "data": "Hello! How can I assist you today?"
}
```

### Deleting a session

Once you've finished with your conversation, you can delete the session with the `/delete-session` endpoint.

This will clear the history of your converstion in that session from memory, and free up those resources for other uses.

The `POST /delete-session/<SESSION_UUID>` endpoint does not need a request body in order to complete, you can just make a request to that endpoint.

## Endpoints

### GET /new-session

Example request body:

**_This endpoint accepts no body in a request._**

Example response body:

```json
{
    "status": "ok",
    "data": "9d6e0981-afde-4596-84d4-6ade613dfbbd"
}
```

### POST /send/<SESSION_UUID>

Example request body:

```json
{
    "message" : "Hello, there!"
}
```

Required request headers:

`Content-Type: application/json`

Example response body:

```json
{
    "status": "ok",
    "data": "Hello! How can I assist you today?"
}
```

### POST /delete-session/<SESSION_UUID>

Example request body:

**_This endpoint accepts no body in a request._**

Example response body:

```json
{
    "status": "ok",
    "message": "Successfully deleted session with ID \"dfa40abf-5e0d-49c8-9274-022507ce3a45\""
}
```
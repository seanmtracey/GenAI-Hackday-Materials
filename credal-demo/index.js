import _ from './env.js';
import { Configuration, OpenAIApi } from "openai";
import { v4 as uuidv4 } from 'uuid';

import express from 'express';
import bodyParser from 'body-parser';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

const SESSIONS = {};

const OPENAI_CLIENT = new OpenAIApi(
  new Configuration({
    apiKey: process.env.CREDAL_API_KEY, // https://app.credal.ai/api-tokens
    basePath: "https://api.credal.ai/api/openai",
  }),
);

app.get('/new-session', (req, res) => {

    const sessionUUID = uuidv4();

    SESSIONS[sessionUUID] = [];

    res.json({
        status : "ok",
        data : sessionUUID
    });

});

app.post('/send/:SESSION_UUID', async (req, res) => {
    console.log(req.params.SESSION_UUID);

    const sessionUUID = req.params.SESSION_UUID;

    const session = SESSIONS[sessionUUID];

    if(!session){
        res.status(404);
        res.json({
            status : "err",
            message : `Could not find a session with ID "${sessionUUID}"`
        });
    } else {
        
        session.push({
            "role" : "user",
            "content" : req.body.message
        });

        const completion = await OPENAI_CLIENT.createChatCompletion({
          model: "gpt-4",
          messages: session,
        });

        console.log(completion.data.choices[0]);

        session.push(completion.data.choices[0].message);

        res.json({
            status : "ok",
            data : completion.data.choices[0].message.content
        });


    }

});

app.post('/delete-session/:SESSION_UUID', async (req, res) => {

    const sessionUUID = req.params.SESSION_UUID;

    if(!SESSIONS[sessionUUID]){
        res.status(404);
        res.json({
            status : "err",
            message : `Could not find a session with ID "${sessionUUID}"`
        });

        return;

    } 

    try {
        delete SESSIONS[sessionUUID];
    } catch (err) {

        console.log(err);
        res.status(500)
        res.json({
            status : "err",
            message : `Could not delete session with ID "${sessionUUID}"`
        });
    }

    if(!SESSIONS[sessionUUID]){
        res.json({
            status : "ok",
            message : `Successfully deleted session with ID "${sessionUUID}"`
        });
    } else {
        res.status(500)
        res.json({
            status : "err",
            message : `Tried to delete session with ID "${sessionUUID}", but was unable to confirm deletion`
        });
    }

});
  
app.listen(PORT);




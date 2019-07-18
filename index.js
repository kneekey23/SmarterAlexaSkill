// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const comprehend = new AWS.Comprehend();
const s3Bucket = 'sneaker-calendar-brands';
const s3 = new AWS.S3();

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to sneaker release. What shoes are you looking for?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const SneakerIntentMatchHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'sneakerIntent'
            && handlerInput.requestEnvelope.request.intent.slots.brandName.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_MATCH'
            
    },
    handle(handlerInput) {
        const speakOutput = 'Tomorrow';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const SneakerIntentNoMatchHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'sneakerIntent'
            && handlerInput.requestEnvelope.request.intent.slots.brandName.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_NO_MATCH'
    },
    handle(handlerInput) {
       
        let entityUnMatched = handlerInput.requestEnvelope.request.intent.slots.brandName.value;
         const speakOutput = "We don't have information for " + entityUnMatched + " but we are always learning and adding new brands everyday."
        console.log(entityUnMatched);
        var params = {
          LanguageCode: 'en', /* required */
          Text: entityUnMatched /* required */
        };
        comprehend.detectEntities(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else{
              console.log(data);   
              let entityJson = data.Entities[0]
              let entityName = data.Entities[0].Text
              let keyName = entityName +".json";
              let buffer = Buffer.from(JSON.stringify(entityJson));
              
              
               var params = {
                  ACL: "public-read", 
                  Body: buffer, 
                  Bucket: s3Bucket, 
                  Key: keyName
                 };
                 s3.putObject(params, function(err, data) {
                   if (err) console.log(err, err.stack); // an error occurred
                   else     console.log(data);           // successful response
                   /*
                   data = {
                    ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
                    VersionId: "Kirh.unyZwjQ69YxcQLA8z4F5j3kJJKr"
                   }
                   */
                 });
            }
        });
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        //const speakOutput = 'Goodbye!';
        
        let entityUnMatched = handlerInput.requestEnvelope.request.intent.slots.brandName.value;
        const speakOutput = "We don't have information for " + entityUnMatched + " but we are always learning and adding new brands everyday."
        console.log(entityUnMatched);
        var params = {
          LanguageCode: 'en', /* required */
          Text: entityUnMatched /* required */
        };
        comprehend.detectEntities(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else{
              console.log(data);   
              let entityJson = data.Entities[0]
              let entityName = data.Entities[0].Text
              let keyName = entityName +".json";
              let buffer = Buffer.from(JSON.stringify(entityJson));
              
              
               var params = {
                  ACL: "public-read", 
                  Body: buffer, 
                  Bucket: s3Bucket, 
                  Key: keyName
                 };
                 s3.putObject(params, function(err, data) {
                   if (err) console.log(err, err.stack); // an error occurred
                   else     console.log(data);           // successful response
                   /*
                   data = {
                    ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
                    VersionId: "Kirh.unyZwjQ69YxcQLA8z4F5j3kJJKr"
                   }
                   */
                 });
            }
        });
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SneakerIntentMatchHandler,
        SneakerIntentNoMatchHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        ) 
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();
'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

var fs = require('fs');
var moment = require('moment');
var ExpressWaf = require('express-waf');

const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
var Client = require('node-rest-client').Client;

var Q1 = false;
var Q2 = false;
var watch             = false;
var reserve_watch     = false;
var other_restaurant  = false;
var noNappy           = false;

let token = "EAAPkmmX73lgBAEmyxZCuwDw9iLkyEUrJv4sHIM2OM2uqOLhSm2a5f21ZCPusywyzdPBt3s9LTz0JfrxkkZArnZCxaQDpPUSQv2yLxslle0H5aaNjGPozW1gCKXcJmacp2oMz8gvZBlF5MfmNMEtgyjmsIbvDJyHXFKPzPwP62YQZDZD";

const server = express()

  // Allows us to process the data
  .use(bodyParser.urlencoded({extended: false}))
  .use(bodyParser.json())

  // Route
  .use(express.static('public'))
  .get('/', function(req, res) {
    res.send(path.join(__dirname, '/public'));
  })

  // Facebook
  .get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === "ansontesting") {
      res.send(req.query['hub.challenge'])
    }
    res.send("Wrong token")
  })

  .post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            receivedMessage(event);
          } else if (event.postback) {
            receivedPostback(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      res.sendStatus(200);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


function receivedMessage(event) {
  console.log(event.sender);
  console.log(event.recipient);
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageIntent;
  console.log(messageIntent);
  // console.log('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/08939128-978d-408d-9c01-0f791c357d69?subscription-key=11fed51d7ec04c6bac9d1c0e60a0e9c5&verbose=true&q=');
  // console.log(messageText);
  var client = new Client();

  console.log('--------ansonv3--------');
  client.get("https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/dbfed576-0421-475e-b793-f165f846bf62?subscription-key=42440c4b8a6446019961eb161cbe1765&timezoneOffset=0&verbose=true&q=" + messageText, function (data, response) {
    // parsed response body as js object 
    messageIntent = data.topScoringIntent.intent;
    if (data.entities[0] != null) {
      var entityType = data.entities[0].type;
      console.log(entityType);
    }
    // raw response 
    // console.log(response);

    var messageAttachments = message.attachments;
    console.log('---------------------testing--------------------');
    console.log(message);
    console.log('---------------------testing--------------------');

    if (messageText) {
      // switch(messageText) {
      //   case 'hi':
      //   case 'Hi':
      //     sendTextMessage(senderID, "Hi! How can I help you today?");
      //   break;
      //   case 'travel insurance':
      //   case 'Travel insurance':
      //     sendTextMessage(senderID, "Sure, I can definitely help you with that!");

      //     setTimeout(function(){
      //       sendTextMessage(senderID, "But first,  do you mind telling me a bit more about your trip?");
      //     }, 1000);

      //     setTimeout(function(){
      //       sendTextMessage(senderID, "When will you be traveling?");
      //     }, 2000);
      //   break;
      //   case '15-May to 19-May':
      //   case '15-may to 19-may':
      //     sendTextMessage(senderID, "Great! Will you be traveling by yourself or with someone else?");
      //   break;
      //   case 'myself':
      //   case 'Myself':
      //     sendTextMessage(senderID, "Perfect. Based on what you just told me, a single-trip travel insurance is available for as low as HKD 155.");

      //     setTimeout(function(){
      //       sendTextMessage(senderID, "Are you interested in more details?");
      //     }, 1000);
      //   break;
      //   case 'Yes':
      //   case 'yes':
      //     sendTextMessage(senderID, "Great! Please click below link and I would be happy to take you to the FWD web site with more information.");
          
      //     setTimeout(function(){
      //       sendFWDlinkMessage(senderID);
      //     }, 1000);
      //   break;
      //   case 'Doctor lookup':
      //   case 'doctor lookup':
      //     sendTextMessage(senderID, "Sure, I would be glad to help!");
          
      //     setTimeout(function(){
      //       sendTextMessage(senderID, "But first, just so I can give you the right information, what is your policy number?");
      //     }, 1000);
      //   break;
      //   case '500019198':
      //     sendInsurMessage(senderID);
      //   break;
      //   case 'General practitioner':
      //   case 'General Practitioner':
      //     sendDoctorMessage(senderID);
      //   break;
      // }
      // If we receive a text message, check to see if it matches a keyword
      // and send back the example. Otherwise, just echo the text we received.
      // Intent
      switch (messageIntent) {
        case 'testing':
          sendTestingMessage(senderID);
          break;

        case 'generic':
          sendGenericMessage(senderID);
          break;

        case 'greetings':
          sendGreetingMessage(senderID);
        break;

        case 'thanks':
        case 'bye':
          sendByeMessage(senderID);
          Q1 = false;
          Q2 = false;
        break;

        // case 'shopping':
        // case 'entertainment':
        //   Q1 = true;
        //   sendShoppingMessage(senderID);
        //   break;

        case 'dining':
            if(data.entities.length>1){
              sendTextMessage(senderID, "Sure, I would be happy to help you. \nHere is the list of Western restaurants in North Point, Hong Kong:", function(err, recipientId){
                sendFoodDetailMessage(recipientId, function(err, recipientId){
                  sendTextMessage(recipientId,"Is there anything else I can help with?");
                })
              });
            }
            else{
              sendFoodMessage(senderID);
            }
          break;
        case 'trip':
          sendTextMessage(senderID, "Sure, I can help you with that. \nWith your current balance of 17,352 miles, here is the list of available redemption destinations:", function(err, recipientId){
            sendTripMessage(recipientId, function(err,recipientId){
              sendTextMessage(senderID,"Is there anything else I can help with?");
            });
          })
        break;
        case 'food':
            sendTextMessage(senderID, "Great! These are the Western restaurants in your area.", function(err,recipientId){
              if(err){
                console.log(err);
              }
              else{
                sendRestaurantMessage(recipientId);
              }
            });
            // sendRestaurantMessage(senderID);
            // other_restaurant = true;
          break;

        case 'transportation':
          getLocationMessage(senderID);
          break;
        case 'location':
          sendLocationMessage(senderID);
          break;
        case 'nappy':
        sendTextMessage(senderID,"Sure, I can help with that. Based on your current location, the nearest nappy change facility is on 12/F:");
          sendNappyChangeMessage(senderID, function(){
            sendTextMessage(senderID, "I'm sorry… I couldn't help but notice that you might be traveling with a small child. :) Would you be interested in hearing about some promotions on children's wear?");
            noNappy = true;
          });
          // setTimeout(function(){
              
          //   }, 1000);
          
          break;




        default:
        console.log('-----------------others----------------');
        console.log(other_restaurant);
        console.log('-----------------others----------------');
        if (messageText == 'tag watch') {
          sendShopMessage(senderID);

        } else if (other_restaurant) {
          if (entityType == 'positiveFeedback') {
            sendRestaurantMessage2(senderID);
            setTimeout(function(){
              sendAnythingElseMessage(senderID);
            }, 1000);
          }
          other_restaurant = false;

        } else if (reserve_watch) {
          if (entityType == 'positiveFeedback') {
            sendTextMessage(senderID, "Great! The watch will be held for 48 hours.");
            setTimeout(function(){
              sendAnythingElseMessage(senderID);
            }, 1000);
          }
          reserve_watch = false;

        } else if (watch) {
          if (entityType == 'positiveFeedback') {
            sendShopMessage(senderID);
            setTimeout(function(){
              sendTextMessage(senderID, "Thank you. Here are the stores featuring the Tag Heuer Carrera watches.");
            }, 1000);
          }
          watch = false;

        }
        else if (noNappy){
          if(entityType =='positiveFeedback'){
            sendTextMessage(senderID,"Great! Here is the current promotion at GAP KIDS / Baby GAP:", function(){
              noNappyMessage(senderID, function(){
                sendTextMessage(senderID,"Is there anything else I can help with?");
              });
            });
          }
          noNappy = false;
        }
        else if(entityType == 'nonPositiveFeedback'){
          sendTextMessage(senderID, "Great! Happy to help you today. See you soon!");
        }
         else {
          sendTextMessage(senderID, "I'm sorry, but I didn't understand your answer.");
        }
      }
    } else if (messageAttachments) {
      if (messageAttachments[0].payload.coordinates) {
        var lat = messageAttachments[0].payload.coordinates.lat;
        var long = messageAttachments[0].payload.coordinates.long;
        sendDirectionMessage(senderID, lat, long, "We are at 500 Hennessy Rd, Causeway Bay");
        // sendTextMessage(senderID, "We are at 500 Hennessy Rd, Causeway Bay");
      } else {   
        sendTextMessage(senderID, "Thank you for the picture! I see that it's the Tag Heuer Carrera watch, right? ;)");
        watch = true;
      }
      // console.log(message.attachments.delivery);
    }
  });
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;
  console.log("payload :" + payload);

  switch(payload){
    case "alibi":
    break;
    case "beerliner":
    break;
    case "sky726":
      var messageData = {
        "recipient" : {
          "id" : senderID
        },
        "message" : {
          "attachment" : {
            "type" : "template",
            "payload" : {
              "template_type" : "generic",
              "elements": [
                {
                  "title" : "SKY726",
                  "subtitle" : "Address: 25/F, 726 Nathan Rd, \n phone: 23903889 \n Rate: HK$2 = 1 Mile",
                  "image_url" : "https://amlchat.herokuapp.com/img/sky726.png",
                  "default_action" : {
                    "type" : "web_url",
                    "url" : "http://dining.asiamiles.com/partner/sky726?a=Mongkok"
                  },
                  "buttons" : [
                    {
                      "type" : "web_url",
                      "url" : "http://dining.asiamiles.com/partner/sky726?a=Mongkok",
                      "title" : "website"
                    }
                  ]
                }
              ]
            }
          }
        }
      }
      callSendAPI(messageData);
    break;
    case "beerhouse":
    break;
  }
  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  // sendTextMessage(senderID, "There is currently a promotion for 15% off for spendings over HKD 500 from 1-Mar to 31-Mar! \u000A \u000AWould you like to reserve this Tag Heuer model for you?");
  // reserve_watch = true; 
}

function sendTextMessage(recipientId, messageText,callback) {
  console.log('Q1: ' + Q1);
  console.log('Q2: ' + Q2);
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData, function(err){
    if(!err){
      if(callback){
        callback(null,recipientId);
      }
    }
  });
}

function sendTestingMessage(recipientId) {
  var messageData = {
    recipient: {
        id: recipientId
    },
    "message":{
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"What do you want to do next?",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://petersapparel.parseapp.com",
              "title":"Show Website"
            },
            {
              "type":"postback",
              "title":"Start Chatting",
              "payload": "Start Chatting"
            }
          ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type:"phone_number",
              title:"Call Representative",
              payload:"+15105551234"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
var insur_option = [
        {
          "content_type":"text",
          "title":"General Practitioner",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/insur/practitioner.png"
        },
        {
          "content_type":"text",
          "title":"Chinese Medicine",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/insur/chinese.png"
        },
        {
          "content_type":"text",
          "title":"Specialist",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/insur/specialist.png"
        },
        {
          "content_type":"text",
          "title":"Physiotherapy",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/insur/physiotherapy.png"
        },
        {
          "content_type":"text",
          "title":"Chiropractor",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/insur/chiropractor.jpg"
        }
      ];
var mall_option = [
        {
          "content_type":"text",
          "title":"Dining",
          "payload":"",
          "image_url":"https://fbmsger.herokuapp.com/img/icon/mall/dining.png"
        },
        {
          "content_type":"text",
          "title":"Shopping",
          "payload":"",
          "image_url":"https://fbmsger.herokuapp.com/img/icon/mall/shopping.png"
        },
        {
          "content_type":"text",
          "title":"Entertainment",
          "payload":"",
          "image_url":"https://fbmsger.herokuapp.com/img/icon/mall/entertainment.png"
        }
      ];
var shop_options = [
        {
          "content_type":"text",
          "title":"Fashion",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/shop/fashion.png"
        },
        {
          "content_type":"text",
          "title":"Jewelry",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/shop/jewelry.png"
        },
        {
          "content_type":"text",
          "title":"Lifestyle",
          "payload":"",
          "image_url":"https://anson-messenger.herokuapp.com/img/icon/shop/lifestyle.png"
        }
      ];

var food_options = [
        {
          "content_type":"text",
          "title":"Chinese",
          "payload":"",
          "image_url":"https://amlchat.herokuapp.com/img/icon/food/dimsum.png"
        },
        {
          "content_type":"text",
          "title":"Asian",
          "payload":"",
          "image_url":"https://amlchat.herokuapp.com/img/icon/food/asianfood.png"
        },
        {
          "content_type":"text",
          "title":"Hotel Dining",
          "payload":"",
          "image_url":"https://amlchat.herokuapp.com/img/icon/food/hoteldining.png"
        },
        {
          "content_type":"text",
          "title":"Western",
          "payload":"",
          "image_url":"https://amlchat.herokuapp.com/img/icon/food/spagetti.png"
        },
        {
          "content_type":"text",
          "title":"Others",
          "payload":"",
          "image_url":"https://amlchat.herokuapp.com/img/icon/food/burger.png"
        }
      ];

function sendFoodDetailMessage(recipientId, callback){
  var messageData = {
    "recipient" : {
      "id" : recipientId
    },
    "message" : {
      "attachment" : {
        "type" : "template",
        "payload" : {
          "template_type" : "generic",
          "elements" : [
            {
              "title" : "Le 188 Restaurant & Lounge (Harbour Grand Hong Kong)",
              "image_url" : "https://amlchat.herokuapp.com/img/restaurant_img/le188.png",
              "subtitle" : "Address: 41/F,Harbour Grand Hong Kong, 23 Oil Street North Point,Hong Kong",
              "default_action" : {
                "type" : "web_url",
                "url" : "http://dining.asiamiles.com/partner/le-188-restaurant-lounge?a=North%20Point"
              },
              "buttons" : [
                {
                  "type" : "web_url",
                  "url" : "http://dining.asiamiles.com/partner/le-188-restaurant-lounge?a=North%20Point",
                  "title" : "More details"
                },
                {
                  "type" : "element_share"
                }
              ]
            }
          ]
        }
      }
    }
  }

  callSendAPI(messageData, callback);
}

var tripOptions = [
    {
      "title" : "ChangSha",
      "image_url" : "https://amlchat.herokuapp.com/img/trip/changsha.jpg",
      "subtitle" : "15000 Miles",
      "default_action" : {
        "type" : "web_url",
        "url" : "https://www.asiamiles.com/am/en/flightsearchlogin?ACTION=RED_AWARD_SEARCH&ENTRYLANGUAGE=en&ENTRYCOUNTRY=HK&ERRORURL=https://www.asiamiles.com/amwdsibered/jsp/redeem-flights/asia-miles-flight-award-redemption.jsp?IBERedeemType_byDest&DEPARTUREDATE=20170620&ARRIVALDATE=20170624&ORIGIN=HKG&DESTINATION=CSX&CABINCLASS=Y&TRIPTYPE=R&ADULT=1&CHILD=0&INFANT=0&FLEXIBLEDATE=true&MEMBERID=undefined"
      },
      "buttons": [
        {
          "type" : "web_url",
          "url" : "https://www.asiamiles.com/am/en/flightsearchlogin?ACTION=RED_AWARD_SEARCH&ENTRYLANGUAGE=en&ENTRYCOUNTRY=HK&ERRORURL=https://www.asiamiles.com/amwdsibered/jsp/redeem-flights/asia-miles-flight-award-redemption.jsp?IBERedeemType_byDest&DEPARTUREDATE=20170620&ARRIVALDATE=20170624&ORIGIN=HKG&DESTINATION=CSX&CABINCLASS=Y&TRIPTYPE=R&ADULT=1&CHILD=0&INFANT=0&FLEXIBLEDATE=true&MEMBERID=undefined",
          "title" : "Book the ticket"
        },
        {
          "type" : "element_share"
        }
      ]
    },
    {
      "title" : "FuZhou",
      "image_url" : "https://amlchat.herokuapp.com/img/trip/fuzhou.jpg",
      "subtitle" : "15000 Miles",
      "default_action" : {
        "type" : "web_url",
        "url" : "https://www.asiamiles.com/am/en/flightsearchlogin?ACTION=RED_AWARD_SEARCH&ENTRYLANGUAGE=en&ENTRYCOUNTRY=HK&ERRORURL=https://www.asiamiles.com/amwdsibered/jsp/redeem-flights/asia-miles-flight-award-redemption.jsp?IBERedeemType_byDest&DEPARTUREDATE=20170620&ARRIVALDATE=20170624&ORIGIN=HKG&DESTINATION=FOC&CABINCLASS=Y&TRIPTYPE=R&ADULT=1&CHILD=0&INFANT=0&FLEXIBLEDATE=true&MEMBERID=undefined"
      },
      "buttons": [
        {
          "type" : "web_url",
          "url" : "https://www.asiamiles.com/am/en/flightsearchlogin?ACTION=RED_AWARD_SEARCH&ENTRYLANGUAGE=en&ENTRYCOUNTRY=HK&ERRORURL=https://www.asiamiles.com/amwdsibered/jsp/redeem-flights/asia-miles-flight-award-redemption.jsp?IBERedeemType_byDest&DEPARTUREDATE=20170620&ARRIVALDATE=20170624&ORIGIN=HKG&DESTINATION=FOC&CABINCLASS=Y&TRIPTYPE=R&ADULT=1&CHILD=0&INFANT=0&FLEXIBLEDATE=true&MEMBERID=undefined",
          "title" : "Book the ticket"
        },
        {
          "type" : "element_share"
        }
      ]
    },
    {
      "title" : "Da Nang",
      "image_url" : "https://amlchat.herokuapp.com/img/trip/danang.jpg",
      "subtitle" : "15000 Miles",
      "default_action" : {
        "type" : "web_url",
        "url" : "https://www.asiamiles.com/am/en/flightsearchlogin?ACTION=RED_AWARD_SEARCH&ENTRYLANGUAGE=en&ENTRYCOUNTRY=HK&ERRORURL=https://www.asiamiles.com/amwdsibered/jsp/redeem-flights/asia-miles-flight-award-redemption.jsp?IBERedeemType_byDest&DEPARTUREDATE=20170621&ARRIVALDATE=20170628&ORIGIN=HKG&DESTINATION=DAD&CABINCLASS=Y&TRIPTYPE=R&ADULT=1&CHILD=0&INFANT=0&FLEXIBLEDATE=true&MEMBERID=undefined"
      },
      "buttons": [
        {
          "type" : "web_url",
          "url" : "https://www.asiamiles.com/am/en/flightsearchlogin?ACTION=RED_AWARD_SEARCH&ENTRYLANGUAGE=en&ENTRYCOUNTRY=HK&ERRORURL=https://www.asiamiles.com/amwdsibered/jsp/redeem-flights/asia-miles-flight-award-redemption.jsp?IBERedeemType_byDest&DEPARTUREDATE=20170621&ARRIVALDATE=20170628&ORIGIN=HKG&DESTINATION=DAD&CABINCLASS=Y&TRIPTYPE=R&ADULT=1&CHILD=0&INFANT=0&FLEXIBLEDATE=true&MEMBERID=undefined",
          "title" : "Book the ticket"
        },
        {
          "type" : "element_share"
        }
      ]
    }
]
function sendTripMessage(recipientId, callback){
  var messageData = {
    "recipient" : {
      "id" : recipientId
    },
    "message" : {
      "attachment" : {
        "type" : "template",
        "payload" : {
          "template_type" : "generic",
          "elements" : tripOptions
        }
      }
    }
  }

  callSendAPI(messageData, callback);
}

function sendFoodMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text":"Sure, I can help you with that. What type of restaurants are you looking for?",
      "quick_replies" : food_options
    }
  };  

  callSendAPI(messageData);
}

// function sendFoodMessageCallback(err,recipientId){
//   if(err!=null){
//     console.log(err);
//   }
//   else{
//     var messageData = {
//       "recipient" : {
//         "id" : recipientId
//       },
//       "message":{
//           "attachment":{
//             "type":"template",
//             "payload":{
//               "template_type":"generic",
//               "elements":[
//                 {
//                   ""
//                 }
//               ]
//             }
//           }
//         }
//     }
//   }
// }

function sendShoppingMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text":"Sure! What type of store are you looking for?",
      "quick_replies":shop_options
    }
  };  

  callSendAPI(messageData);
}

function sendGreetingMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text":"Hello! How can I help you today? :)"
    }
  };  

  callSendAPI(messageData);
  // sendVideoMessage(recipientId);
}


function sendInsurMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text":"Great! What type of doctor are you looking for?",
      "quick_replies":insur_option
    }
  };  

  callSendAPI(messageData);
  // sendVideoMessage(recipientId);
}

function sendAnythingElseMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text":"Anything else are you looking for?",
      "quick_replies":mall_option
    }
  };  

  callSendAPI(messageData);
}
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "attachment":{
        "type":"video",
        "payload":{
          "url":"https://anson-messenger.herokuapp.com/video/leegardens.mp4"
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendByeMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text":"You're welcome! :) \u000AWe hope to see you soon! :)"
    }
  };  

  callSendAPI(messageData);
  // setTimeout(function(){
  //   sendTextMessage(recipientId, "To know more about us, watch this clip!");
  // }, 1000);
}

function sendFWDlinkMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "FWD", 
            item_url: "https://www.fwd.com.hk",               
            image_url: "https://anson-messenger.herokuapp.com/img/icon/insur/fwd.jpg", 
            buttons: [{
              type:"web_url",
              title:"Policy details",
              url:"https://www.fwd.com.hk"
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendDoctorMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Dr. Kwong Wai Yan",
            subtitle: "Room 503, On Lok Yuen Building 25 Des Voeux Road, Central",   
            buttons: [{
              type:"phone_number",
              title:"Contact",
              payload:"28696112"
            },{
              "type":"element_share"
            }]
          }, {
            title: "Dr. Lam Paul CHC-Group Medical Practice",
            subtitle: "14/F., Li Dong Building, 9 Li Yuen Street East, Central",   
            buttons: [{
              type:"phone_number",
              title:"Contact",
              payload:"25258158"
            },{
              "type":"element_share"
            }]
          }, {
            title: "Dr. Lam Wai Fat",
            subtitle: "Rm 1200, Asia Standard Tower 59-65 Queen's Road Central",   
            buttons: [{
              type:"phone_number",
              title:"Contact",
              payload:"28510688"
            },{
              "type":"element_share"
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendRestaurantMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Alibi - Wine Dine Be Social (Cordis, Hong Kong)",
            subtitle: "Located on the fifth floor of the hotel, the 5,500 square foot urban chic space presents all that a bar should have and a little more, as well as be true to its namesake – a place to escape, wine, dine and be social. ",             
            image_url: "https://amlchat.herokuapp.com/img/restaurant_img/alibi.jpeg",
            buttons: [{
              type:"postback",
              title:"Check this out",
              payload:"alibi"
            },{
              "type":"element_share"
            }]
          }, {
            title: "Beerliner German Bar & Restaurant",
            subtitle: "With a casual yet modern ambiance, Beerliner German Bar & Restaurant brings Germany's best-known culinary traditions to Hong Kong. ",             
            image_url: "https://amlchat.herokuapp.com/img/restaurant_img/beerliner.jpeg",
            buttons: [{
              type:"postback",
              title:"Check this out",
              payload:"beerliner"
            },{
              "type":"element_share"
            }]
          }, {
            title: "SKY726",
            subtitle: "Perched on the top floor of the Nathan 726 with an expansive view of the Mongkok skyline, Sky 726 offers its own perspective on French dining.",              
            image_url: "https://amlchat.herokuapp.com/img/restaurant_img/Sky726.jpeg",
            buttons: [{
              type:"postback",
              title:"Check this out",
              payload:"sky726"
            },{
              "type":"element_share"
            }]
          }, {
            title: "The Beerhouse",
            subtitle: "The Beerhouse is located on the top floor of Langham Place in Mongkok, Kowloon.",             
            image_url: "https://amlchat.herokuapp.com/img/restaurant_img/beerhouse.jpg",
            buttons: [{
              type:"postback",
              title:"Check this out",
              payload:"beerhouse"
            },{
              "type":"element_share"
            }]
          }
          ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}



function sendRestaurantMessage2(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Passion by Gérard Dubois",
            subtitle: "traditional French café experience\u000AMon-Sun 1130-2230\u000ALeee Gardens One, Shop G12",
            item_url: "www.PassionbyGD.com",               
            image_url: "https://anson-messenger.herokuapp.com/img/restaurant_img/passion.jpg",
            buttons: [{
              type:"phone_number",
              title:"Call the shop",
              payload:"+85225291311"
            },{
              "type":"element_share"
            }]
          }, {
            title: "Panino Giusto",
            subtitle: "The gastronomic sanctuary specializes in Italian food\u000AMon-Sun 1030-2230\u000ALeee Gardens One, Shop 204",
            item_url: "www.paninogiusto.com.hk",               
            image_url: "https://anson-messenger.herokuapp.com/img/restaurant_img/paninogiusto.jpg",
            buttons: [{
              type:"phone_number",
              title:"Call the shop",
              payload:"+85225270222"
            },{
              "type":"element_share"
            }]
          }, {
            title: "Seasons by Olivier E.",
            subtitle: "French contemporary dining\u000AMon-Sun 1230-2230\u000ALeee Gardens Two Shop 1311",
            item_url: "www.seasonsbyolivier.com",               
            image_url: "https://anson-messenger.herokuapp.com/img/restaurant_img/seasons.jpg",
            buttons: [{
              type:"phone_number",
              title:"Call the shop",
              payload:"+85225056228"
            },{
              "type":"element_share"
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}



function sendShopMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "TAG Heuer Boutique",
            subtitle: "All about watch.\u000AHysan Place, Shop 1202\u000AMon-Sun 1000-2200",
            item_url: "http://tagheuer.com",               
            image_url: "https://anson-messenger.herokuapp.com/img/shop_img/tag.jpg",
            buttons: [
            {
              "type":"postback",
              "title":"Check Promotion",
              "payload":"DEVELOPER_DEFINED_PAYLOAD"
            },{
              type:"phone_number",
              title:"Call the shop",
              payload:"+85227509262"
            },{
              "type":"element_share"
            }]
          }, {
            title: "City Chain Glam Timepieces",
            subtitle: "All about watch.\u000AHysan Place, Shop 0221\u000AMon-Sun 1100-2300",
            item_url: "http://www.citychain.com",               
            image_url: "https://anson-messenger.herokuapp.com/img/shop_img/citychain.jpg",
            buttons: [{
              type:"phone_number",
              title:"Call the shop",
              payload:"+85223750876"
            },{
              "type":"element_share"
            }]
          }, {
            title: "Prince Jewellery & Watch",
            subtitle: "Luxury watch and jewellery collections. \u000AHysan Place, Shop 0503\u000AMon-Sun 0930 - 2130",
            item_url: "www.princejewellerywatch.com",               
            image_url: "https://anson-messenger.herokuapp.com/img/shop_img/prince.png",
            buttons: [{
              type:"phone_number",
              title:"Call the shop",
              payload:"+85227392333"
            },{
              "type":"element_share"
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}


function getLocationMessage(recipientId) {

  var messageData = {
    recipient: {
      "id": recipientId
    },
    message: {
      "text":"Please share your location:",
      "quick_replies":[
        {
          "content_type":"location",
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendLocationMessage(recipientId) {

  var messageData = {
    recipient: {
      "id": recipientId
    },
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": {
            "element": {
              "title": "Hysan Place",
              "subtitle": "Causeway Bay",
              "image_url": "https://anson-messenger.herokuapp.com/img/map.jpg",
              "item_url": "https://www.google.com.hk/maps/place/Hysan+Place/"
            }
          }
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendDirectionMessage(recipientId, x, y) {

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"We are at 500 Hennessy Rd, Causeway Bay, Let me show you: ",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://www.google.com.hk/maps/dir/'"+x+","+y+"'/Hysan+Place/",
              "title":"Google Map"
            }
          ]
        }
      }
    }
  };

  // var messageData = {
  //   recipient: {
  //     id: recipientId
  //   },
  //   message: {
  //     "attachment": {
  //       "type": "template",
  //       "payload": {
  //         "template_type": "generic",
  //         "elements": {
  //           "element": {
  //             "title": "Hysan Place",
  //             "subtitle": "Causeway Bay",
  //             "image_url": "https://anson-messenger.herokuapp.com/img/map.jpg",
  //             "item_url": "https://www.google.com.hk/maps/dir/Hysan+Place/'"+x+","+y+"'/"
  //           }
  //         }
  //       }
  //     }
  //   }
  // };

  callSendAPI(messageData);
}


function sendNappyChangeMessage(recipientId, callback){
  var messageData ={
    "recipient" : {
      "id": recipientId
    },
    "message" : {
      "attachment" : {
        "type" : "image",
        "payload" : {
          "url" : "https://fbmsger.herokuapp.com/img/nappy.png"
        }
      }
    }
  }
  callSendAPI(messageData, function(err){
    if(!err){
      if(callback){
        callback();
      }
    }
  });
}

function noNappyMessage(recipientId, callback){
  var messageData = {
    "recipient" : {
      "id" : recipientId
    },
    "message" : {
      "attachment" : {
        "type" : "template",
        "payload" : {
          "template_type" : "generic",
          "sharable" : true,
          "elements" : [
            {
              "title" : "GAP KIDS Baby GAP",
              "image_url" : "https://hp.leegardens.com.hk/DCCustomization/Pages/GetAzureResizedFile.aspx?path=~\\\\lga\\\\media\\\\lga\\\\_resizedImages\\\\hysanplace\\\\shops\\\\items\\\\gap-kid\\\\330x260_gap-kids-sf.jpg",
              "subtitle" : "Gap旗下的GapKids 以及babyGap，也將現身銅鑼灣。GapKids & babyGap以其柔軟的材質及多樣化的風格著稱，Gap對質量嚴格把關，因而獲得眾多荷裡活明星父母的青睞。",
              "default_action" : {
                "type" : "web_url",
                "url" : "https://hp.leegardens.com.hk/#!/shopping-details/hysanplace/Shopping/Items/GAP-KIDS-Baby-GAP-kids",
                "messenger_extensions" : false
              },
              "buttons" : [
                {
                  "type" : "web_url",
                  "title" : "15% off all purchase over HKD 500",
                  "url" : "https://hp.leegardens.com.hk/#!/shopping-details/hysanplace/Shopping/Items/GAP-KIDS-Baby-GAP-kids"
                }
              ]
            }
          ]
        }
      }
    }
  }

  callSendAPI(messageData, function(err){
    if(!err){
      if(callback){
        callback();
      }
    }
  });
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////





function callSendAPI(messageData, callback) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
      if(callback){
        callback(null,recipientId);
      }
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
      if(callback){
        callback(error,recipientId)
      }
    }
  });  
}


// function callSendAPI(messageData) {
//   request({
//     uri: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: { access_token: token },
//     method: 'POST',
//     json: messageData

//   }, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var recipientId = body.recipient_id;
//       var messageId = body.message_id;

//       console.log("Successfully sent generic message with id %s to recipient %s", 
//         messageId, recipientId);
//     } else {
//       console.error("Unable to send message.");
//       console.error(response);
//       console.error(error);
//     }
//   });  
// }
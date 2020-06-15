const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const SES = new AWS.SES();

'use strict';

function sendEmail(formData, callback) {
  const emailParams = {
    Source: process.env.sending_email, // SES SENDING EMAIL
    ReplyToAddresses: [formData.reply_to],
    Destination: {
      ToAddresses: [process.env.receiving_email], // SES RECEIVING EMAIL
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `${formData.message}\n\nName: ${formData.full_name} \nCompany: ${formData.company}\nEmail: ${formData.reply_to}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'New message from Johrten.com',
      },
    },
  };

  SES.sendEmail(emailParams, callback);
}

exports.contactJohrten = (event, context, callback) => {
  const formData = JSON.parse(event.body)
  fetch("https://www.google.com/recaptcha/api/siteverify"+ `?secret=${process.env.recaptcha_secret}&response=${formData["g-recaptcha-response"]}`, {
    method: "POST",
  }).then(r => r.json())
    .then(data => {
      console.log(data);
      if (data.success) {
        sendEmail(formData, function(err, data) {
          const response = {
            statusCode: err ? 500 : 200,
            headers: {
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST"
            },
            body: JSON.stringify({
              message: err ? err.message : data,
            }),
          };
      
          callback(null, response);
        });
      }
    })
};

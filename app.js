const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': '', //get it from your sandbox paypal
  'client_secret': '' //get it from your sandbox paypal
});

const app = express();
//set out view engine to ejs
app.set('view engine', 'ejs');
//set our route
app.get('/', (req, res) => res.render('index'));

//our pay route in our form
app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:4000/success",
        "cancel_url": "http://localhost:4000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Sample Product",
                "sku": "001",
                "price": "100.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "100.00"
        },
        "description": "Our sample product for testing"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(4000, () => console.log('Server Started'));

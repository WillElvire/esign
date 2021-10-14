const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const cors = require('cors')({ origin: true })
admin.initializeApp()

/**
 * Here we're using Gmail to send
 */

const message = ` <p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
<br />
<img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />`

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourgmailaccount@gmail.com',
    pass: 'yourgmailaccpassword',
  },
})



exports.sendReceiverMail = (receiverMail,otherMessage=null )=>{
    return functions.firestore.document('documentsToSign').onCreate((change,context) => {
      functions.https.onRequest((req, res) => {
        cors(request, responce, () => {
          // getting dest email by query string
          const dest = request.query.dest
    
          const mailOptions = {
            from: `Your Account Name <${signeedsEmail}>`, // Something like: Jane Doe <janedoe@gmail.com>
            to: dest,
            subject: "I'M A PICKLE!!!", // email subject
            html: otherMessage ? otherMessage : message 
          }
    
          // returning result
          return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.send(error.toString())
            }
            return res.send('Sended')
          })
        })
      })

      // 

    })
    
}

exports.sendSigneesMail = (signeedsEmail,otherMessage=null) => {
  return functions.https.onRequest((req, res) => {
    cors(request, responce, () => {
      // getting dest email by query string
      const dest = request.query.dest

      const mailOptions = {
        from: `Your Account Name <${signeedsEmail}>`, // Something like: Jane Doe <janedoe@gmail.com>
        to: dest,
        subject: "I'M A PICKLE!!!", // email subject
        html: otherMessage ? otherMessage : message 
      }

      // returning result
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.send(error.toString())
        }
        return res.send('Sended')
      })
    })
  })
}

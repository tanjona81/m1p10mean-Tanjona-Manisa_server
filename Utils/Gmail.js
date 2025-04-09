const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});
const validation = (email, name, date, heure) => {
  // Define email options
  const mailOptions = {
    from: '"Beauty Salon support" ', // Sender email address
    to: email, // Recipient email address
    subject: 'Validation of your meeting', // Email subject
    html: `<h2>Hello ${name},</h2> 
          </br>
          <p>Your meeting has been approved on ${date} at ${heure}</p>
          </br>
          <p>See you soon</p>` // Email body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

const reminder = (email, name, date, heure) => {
  // Define email options
  const mailOptions = {
    from: '"Beauty Salon support"', // Sender email address
    to: email, // Recipient email address
    subject: 'Reminder of your meeting', // Email subject
    html: `<h2>Hello ${name},</h2> 
          </br>
          <p>You have a meeting on ${date} at ${heure}</p>
          </br>
          <p>See you soon</p>` // Email body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

const sendOffer = (email, name, service_name, reduction, date_heure_fin) => {
  // Define email options
  const mailOptions = {
    from: '"Beauty Salon support" ', // Sender email address
    to: email, // Recipient email address
    subject: 'Special Offer for you', // Email subject
    html: `<h2>Hello ${name},</h2> 
          </br>
          <p>Congratulation, you are one of the lucky customer to gain a reduction of ${reduction}% on the service
          ${service_name}. </p>
          <p>This will be available until ${date_heure_fin}</p>
          </br>
          <p>See you soon</p>` // Email body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Send email
module.exports = {
  validation,
  reminder,
  sendOffer
}

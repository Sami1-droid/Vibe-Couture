const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Our Perfume Store!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${data.firstName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for joining our exclusive perfume community. We're excited to help you discover your signature scent!
          </p>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            To get started, please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 50px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link: ${data.verificationUrl}
          </p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Perfume Store. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Welcome to Our Perfume Store!
      
      Hello ${data.firstName}!
      
      Thank you for joining our exclusive perfume community. We're excited to help you discover your signature scent!
      
      To get started, please verify your email address by visiting: ${data.verificationUrl}
      
      © 2024 Perfume Store. All rights reserved.
    `
  }),

  'email-verification': (data) => ({
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${data.firstName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Please verify your email address to complete your account setup.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 50px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Verify Your Email
      
      Hello ${data.firstName}!
      
      Please verify your email address by visiting: ${data.verificationUrl}
    `
  }),

  'password-reset': (data) => ({
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${data.firstName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You requested a password reset for your account. Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 50px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset
      
      Hello ${data.firstName}!
      
      You requested a password reset. Visit this link to reset your password: ${data.resetUrl}
      
      This link will expire in 10 minutes.
    `
  }),

  'order-confirmation': (data) => ({
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${data.firstName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for your order! Your order #${data.orderNumber} has been confirmed and is being processed.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> $${data.total}</p>
            <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.orderUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 50px; font-weight: bold; display: inline-block;">
              View Order
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Order Confirmed!
      
      Hello ${data.firstName}!
      
      Thank you for your order! Your order #${data.orderNumber} has been confirmed.
      
      Order Details:
      Order Number: ${data.orderNumber}
      Total: $${data.total}
      Estimated Delivery: ${data.estimatedDelivery}
      
      View your order: ${data.orderUrl}
    `
  }),

  'shipping-notification': (data) => ({
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Your Order Has Shipped!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${data.firstName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Great news! Your order #${data.orderNumber} has shipped and is on its way to you.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Shipping Details:</h3>
            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            <p style="margin: 5px 0;"><strong>Carrier:</strong> ${data.carrier}</p>
            <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.trackingUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 50px; font-weight: bold; display: inline-block;">
              Track Package
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Your Order Has Shipped!
      
      Hello ${data.firstName}!
      
      Your order #${data.orderNumber} has shipped.
      
      Tracking Number: ${data.trackingNumber}
      Carrier: ${data.carrier}
      Estimated Delivery: ${data.estimatedDelivery}
      
      Track your package: ${data.trackingUrl}
    `
  })
};

// Send email function
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    // Get template content
    const templateContent = emailTemplates[template] ? emailTemplates[template](data) : null;
    
    if (!templateContent) {
      throw new Error(`Email template '${template}' not found`);
    }

    const mailOptions = {
      from: `"Perfume Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: templateContent.text,
      html: templateContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmail = async (recipients, { subject, template, data }) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        to: recipient.email,
        subject,
        template,
        data: { ...data, firstName: recipient.firstName }
      });
      results.push({ email: recipient.email, success: true, messageId: result.messageId });
    } catch (error) {
      results.push({ email: recipient.email, success: false, error: error.message });
    }
  }
  
  return results;
};

// Newsletter subscription email
const sendNewsletterEmail = async ({ to, firstName, subject, content }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Perfume Store Newsletter" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Perfume Store Newsletter</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Hello ${firstName}!</h2>
            <div style="color: #666; line-height: 1.6; font-size: 16px;">
              ${content}
            </div>
          </div>
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">© 2024 Perfume Store. All rights reserved.</p>
            <p style="margin: 10px 0 0 0;">
              <a href="${process.env.CLIENT_URL}/unsubscribe" style="color: #ccc;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Newsletter email failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  sendNewsletterEmail
};
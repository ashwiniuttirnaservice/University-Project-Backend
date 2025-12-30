const axios = require("axios");
const { sms } = require("../config/smsTemplates.js");
const { OTP_SMS, REGISTRATION_SMS_TYPE } = require("../config/constants.js");
const dotenv = require("dotenv");

dotenv.config();

const smsModel = {
  /**
   * Helper: Convert object to query string
   */
  serialize(obj) {
    return (
      "?" +
      Object.keys(obj)
        .map((k) => `${k}=${encodeURIComponent(obj[k])}`)
        .join("&")
    );
  },

  /**
   * Send SMS for new registration
   */
  async sendNewRegistrationSMS(data) {
    try {
      const url = `https://api.pinnacle.in/index.php/sms/urlsms`;
      const sendData = {
        sender: "UTRLLP",
        numbers: data.mobile,
        messagetype: "TXT",
        message: sms.newRegistrationSMS(data),
        response: "Y",
        apikey: process.env.PINNACLE_API_KEY,
      };

      const response = await axios.get(url, { params: sendData });
      console.log(" Registration SMS API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(" SMS Sending Error:", error.message);
      throw new Error("Failed to send registration SMS");
    }
  },

  /**
   * Send OTP or other SMS types
   */
  async sendSMS({ smsDetails, smsType }) {
    try {
      let TEMPLATE = null;

      if (smsType === OTP_SMS) {
        TEMPLATE = sms.otpSMS(smsDetails);
      } else if (smsType === REGISTRATION_SMS_TYPE) {
        TEMPLATE = sms.newRegistrationSMS(smsDetails);
      }

      if (!TEMPLATE) throw new Error("Invalid template for SMS.");

      const url = `https://api.pinnacle.in/index.php/sms/urlsms`;
      const sendData = {
        sender: "UTRLLP",
        numbers: smsDetails.mobile,
        messagetype: "TXT",
        message: TEMPLATE,
        response: "Y",
        apikey: process.env.PINNACLE_API_KEY,
      };

      const response = await axios.get(url, { params: sendData });
      console.log(`📩 ${smsType} SMS API Response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(" SMS Sending Error:", error.message);
      throw new Error("Failed to send SMS");
    }
  },
};

module.exports = smsModel;

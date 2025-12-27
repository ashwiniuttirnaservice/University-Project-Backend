const sms = {
  regSMS: ({ username, password }) =>
    `Dear Applicant, Your registration and payment for recruitment examination is successful. Your login details are as Username:: ${username} Password:: ${password}. Do not share the credentials. UTRLLP`,

  newRegistrationSMS: ({ username, password }) =>
    `Dear Applicant, Your registration for recruitment examination is successful. Your login details are as Username:: ${username} Password:: ${password}. Do not share the credentials. UTRLLP`,

  otpSMS: ({ otp }) =>
    `Your OTP for UTTIRNA portal login verification is ${otp}. Do not share this code with anyone. It is valid for 10 minutes. UTRLLP`,
};

module.exports = { sms };

const transporter = {
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'mock-message-id',
  }),
};

const nodemailer = {
  createTransport: jest.fn(() => transporter),
};

export = nodemailer;

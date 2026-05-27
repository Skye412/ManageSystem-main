import { sendRequest } from './RequestHandler';

class messageApi {
  static async getmessageslist(data, userType = 'student') {
    return sendRequest('/message/getmessageslist', 'POST', true, userType, data);
  }

  static async enterpriseSendMessage(data) {
    return sendRequest('/message/enterpriseSendMessage', 'POST', true, 'enterprise', data);
  }
  static async getChatMessages(data, userType = 'student') {
    return sendRequest('/message/getChatMessages', 'POST', true, userType, data);
  }
  static async studentSendMessage(data) {
    return sendRequest('/message/studentSendMessage', 'POST', true, 'student', data);
  }
}

export default messageApi;
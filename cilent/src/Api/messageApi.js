import { sendRequest } from './comSend';

class messageApi {
  static async getmessageslist(data) {  
    return sendRequest('/message/getmessageslist', 'POST', false, data);
  }

  static async enterpriseSendMessage(data) {
    return sendRequest('/message/enterpriseSendMessage', 'POST', false, data);
  }
  static async getChatMessages(data) {
    return sendRequest('/message/getChatMessages', 'POST', false, data);
  }
  static async studentSendMessage(data) {
    return sendRequest('/message/studentSendMessage', 'POST', false, data);
  }
}


export default messageApi;
import { sendRequest } from './RequestHandler';

class enterpriseApi {
  static async getEnterpriseInfo(data) {
    return sendRequest('/enterprise/getPositionsByCompanyName',"POST",true,'enterprise',data);
  }

  static async getPositionDetail(data) {
    return sendRequest('/enterprise/getPositionDetail',"POST",true,'enterprise',data);
  }

  static async getDeliveriesByEnterpriseId(data) {
    return sendRequest('/enterprise/getDeliveriesByEnterpriseId', "POST",true,'enterprise',data);
  }

  static async addPosition(data) {
    return sendRequest('/enterprise/addPosition',"POST",true,'enterprise',data);
  }
  static async updatePosition(data) {
    return sendRequest('/enterprise/updatePosition',"POST",true,'enterprise',data);
  }

  static async deletePosition(data) {
    return sendRequest('/enterprise/deletePosition',"POST",true,'enterprise',data);
  }

  static async inviteInterview(data) {
    return sendRequest('/enterprise/inviteInterview', "POST",true,'enterprise',data);
  }

  static async acceptCandidate(data) {
    return sendRequest('/enterprise/acceptCandidate', "POST",true,'enterprise',data);
  }

  static async rejectCandidate(data) {
    return sendRequest('/enterprise/rejectCandidate', "POST",true,'enterprise',data);
  }

  static async markAsViewed(data) {
    return sendRequest('/enterprise/markAsViewed', "POST",true,'enterprise',data);
  }
  static async getStudentInfo(data) {
    return sendRequest('/student/getStudentInfo', 'POST', true, 'enterprise', data);
  }
  
  static async getChatMessages(data) {
    return sendRequest('/message/getChatMessages', 'POST', false, 'enterprise', data);
  }
}

export default enterpriseApi;
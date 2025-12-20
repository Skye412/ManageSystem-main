import { sendRequest } from './RequestHandler';

class UserApi {
  static async adminLogin(data) {
    return sendRequest('/user/adminLogin', 'POST', false, 'manage', data);
  }
  
  static async studentLogin(data) {
    return sendRequest('/user/studentLogin', 'POST', false, 'student', data);
  }

  static async getStudentInfo(data) {
    return sendRequest('/user/changePassword', 'POST', false, 'student', data);
  }

  static async enterpriseLogin(data) {
    return sendRequest('/user/enterpriseLogin', 'POST', false, 'enterprise', data);
  }

  static async adminLogout(data) {
    return sendRequest('/user/adminLogout', 'POST', true, 'manage', data);
  }

  static async studentLogout(data) {
    return sendRequest('/user/studentLogout', 'POST', true, 'student', data);
  }

  static async enterpriseLogout(data) {
    return sendRequest('/user/enterpriseLogout', 'POST', true, 'enterprise', data);
  }

  static async refreshToken(data) {
    return sendRequest('/user/refreshToken', 'POST', false, 'student', data);
  }
}

export default UserApi;

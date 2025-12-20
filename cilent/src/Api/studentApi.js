import { sendRequest } from './RequestHandler';

class studentApi {
  static async getStudentInfo(data) {
    return sendRequest('/student/getStudentInfo', 'POST', true, 'student', data);
  }
  static async submitResume(data) {
    return sendRequest('/student/submitResume', 'POST', true, 'student',data);
  }
  // 新增：获取学生简历投递信息
  static async getResumeDeliveries(data) {
    return sendRequest('/student/getResumeDeliveries', 'POST', true,'student', data);
  }
  static async getPositions() {
    return sendRequest("/manage/getPositions","GET",true,'student');
  }
  static async getNotices() {
    return sendRequest("/manage/getNotices", "GET",true,'student');
  }
  static async getPositionDetail(id) {
    return sendRequest(`/manage/getPositionDetail/${id}`, "GET",true,'student');
  }
  static async getNoticeDetail(id) {
    return sendRequest(`/manage/getNoticeDetail/${id}`, "GET",true,'student');
  }
  static async sendMessage(data) {
    return sendRequest('/message/sendMessage', 'POST', true, 'student', data);
  }
}

export default studentApi;
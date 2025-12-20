import { sendRequest } from "./RequestHandler";

class ManageApi {
  static async getMajorsAndClasses() {
    return sendRequest("/manage/getMajorsAndClasses", "GET",true,'manage');
  }

  static async getStudentsByClassName(data) {
    return sendRequest("/manage/getStudentsByClassName","POST",true,'manage',data);
  }
  static async addMajorClass(data) {
    return sendRequest("/manage/addMajorClass","POST",true,'manage',data);
  }
  static async addStudentToClass(data) {
    return sendRequest("/manage/addStudentToClass","POST",true,'manage',data);
  }
  static async addEnterprise(data) {
    return sendRequest("/manage/addEnterprise","POST",true,'manage',data);
  }
  static async getAllEnterprises() {
    return sendRequest("/manage/getAllEnterprises","GET",false);
  }
  static async addPosition(data) {
    return sendRequest("/manage/addPosition","POST",false, 'manage', data);
  }
  static async getPositions() {
    return sendRequest("/manage/getPositions","GET",true,'manage');
  }
  static async deletePosition(data) {
    return sendRequest("/manage/deletePosition","POST",true,'manage',data);
  }
  static async getPositionDetail(id) {
    return sendRequest(`/manage/getPositionDetail/${id}`, "GET",true,'manage');
  }
  static async getEmploymentStatistics() {
    return sendRequest("/manage/getEmploymentStatistics","GET",true,'manage');
  }

  static async getNotices() {
    return sendRequest("/manage/getNotices", "GET",true,'manage');
  }

  static async addNotice(data) {
    return sendRequest("/manage/addNotice", "POST",true,'manage',data);
  }

  static async deleteNotice(data) {
    return sendRequest("/manage/deleteNotice", "POST",true,'manage',data);
  }
  static async getNoticeDetail(id) {
    return sendRequest(`/manage/getNoticeDetail/${id}`, "GET",true,'manage');
  }

  static async reviewPosition(data) {
    return sendRequest("/manage/reviewPosition", "POST",true,'manage',data);
  }
  static async sendMessage(data) {
    return sendRequest('/message/sendMessage', 'POST', true, 'manage', data);
  }

 
}

export default ManageApi;
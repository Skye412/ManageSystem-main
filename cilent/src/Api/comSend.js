import Axiosinstance from './AxiosConfig';


/**
 * 封装请求方法，支持 GET 和 POST，可选择是否携带令牌
 * 
 * @param {string} url 请求的 URL
 * @param {string} method 请求方法（GET 或 POST）
 * @param {boolean} requiresAuth 是否需要携带令牌
 * @param {Object} data 请求数据（GET 作为 URL 参数，POST 作为请求体）
 * @param {Object} config Axios 配置对象（可选）
 * @returns {Promise} 返回 Axios 响应对象
 */
export async function sendRequest(url, method = 'GET', requiresAuth = false, data = null, config = {}) {
  try {
    // 如需授权，设置令牌
    if (requiresAuth) {
    //   const userStore = useUserStore();
    //   const isAuthenticated = userStore.accesstoken !== '';
      if (!isAuthenticated) {
        throw new Error('未授权，请先登录');
      }
      Axiosinstance.defaults.headers.common['Authorization'] = `Bearer ${userStore.accesstoken}`;
    }

    // 根据请求方法发送请求
    let response;
    if (method.toUpperCase() === 'GET') {
      response = await Axiosinstance.get(url, { params: data, ...config });
    } else if (method.toUpperCase() === 'POST') {
      response = await Axiosinstance.post(url, data, config);
    } else {
      throw new Error(`不支持的请求方法: ${method}`);
    }

    return response;
  } catch (error) {
    throw error;
  }
}
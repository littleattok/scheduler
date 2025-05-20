import axios from 'axios';
import store from '../store';


const apiClient  = axios.create({
    baseURL: '/api' , // api 기본 경로
    headers: {
        'Content-Type': 'application/json',
    },
});



// 요청 인터셉터

apiClient.interceptors.request.use(
    (config) => {
        const token = store.getters.accessToken;        //Vuex 스토어에서 액세스 토큰 가져오기
        if( token){
            config.headers['Authorization'] = 'Bearer' + token;
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
);

// TODO: 응답 인터셉터 ( 401 오류 발생시 토큰 재발급 로직)은 나중에 다시 추가하기

export default apiClient;
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


let isRefreshing = false;
let failedQueue = []; // 실패한 요청을 저장할 큐
const processQueue = (error, token = null) =>{
    failedQueue.forEach(prom=>{
        if(error){
            prom.reject(error);
        }
        else{
            prom.serolve(token);
        }
    });
    failedQueue = [];
}






// TODO: 응답 인터셉터 ( 401 오류 발생시 토큰 재발급 로직)은 나중에 다시 추가하기
apiClient.interceptors.response.use(
    (response) => {
        //정상 응답은 그대로 반환하기
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        //401 에러이고 아직 토큰 재발급 시도를 하지 않았을 경우
        if(error.response.status === 401 && !originalRequest._retry){

            if(isRefreshing){

                //토큰 재발급중이면 현재 요청을 큐에 넣고 대기하기
                return new Promise((resolve, reject)=>{
                    failedQueue.push({resolve, reject});
                })
                .then(token =>{
                    originalRequest.headers['Authorization']= 'Bearer' +token;
                    return apiClient(originalRequest);      // 새 토큰으로 원래 요청 재시도
                })
                .catch((err =>{
                    return Promise.reject(err); //큐 처리 중 에러 발생시 거절
                }));
            }

            originalRequest._retry = true; //재시도 플래그 설정( 무한루프 방지)
            isRefreshing = true; //토큰 재발급 중 플래그 설정

            try{
                const newAccessToken = await store.dispatch('refreshToken'); // 이 액션은 새 토큰을 반환해야함
                isRefreshing = false; 
                processQueue(null, newAccessToken); // 대기중인 모든 요청에 새 토큰 전달하여 재시도
                originalRequest.headers['Authorization'] = 'Bearer' + newAccessToken; // 새 토큰으로 헤더 설정
                return apiClient(originalRequest); // 새 토큰으로 원래 요청 재시도
                
            }
            catch(refreshError){
                isRefreshing = false;
                processQueue(refreshError, null); // 대기중인 모든 요청에 대해 에러 전달
                
                //토큰 재발급 실패 시 로그아웃 처리 ( store action 내에서 처리하거나 App.vue 등에서 감지)
                store.dispatch('logout'); // Vuex logout 액션 호출( 순환참조 주의, 필요시 수정하기)
                console.error('토큰 재발급 실패, 로그아웃 처리', refreshError);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error); // 그 외의 에러는 그대로 거절

    }
)


export default apiClient;
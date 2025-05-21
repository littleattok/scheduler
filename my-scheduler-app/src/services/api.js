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
apiClient.interceptors.response.use(
    (response) => {
        //정상 응답은 그대로 반환하기
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        //401 에러이고 아직 토큰 재발급 시도를 하지 않았을 경우
        if(error.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true; //재시도 플래그 설정( 무한루프 방지)

            //여러 요청이 동시에 401 에러를 받을 경우 , 한 번만 refreshToken을 호출하도록 처리
            //store 외부의 refreshingTokenPromise 변수를 사용하기.
            // (store/index.js 상단에 let refreshingTokenPromise = null 선언 필요)
            if ( !refreshingTokenPromise){
                // refreshingTokenPromise는 store/index.js에서 가져와야 합니다.
                // 더 나은 방법은 store state로 관리하는 것입니다.
                // 여기서는 store/index.js에 선언된 전역 변수를 사용한다고 가정합니다.
                // 하지만 이는 이상적인 패턴은 아니며, 실제로는 store state (isRefreshing) 또는
                // event bus 등을 활용하는 것이 좋습니다.
                // 이번 예제에서는 store/index.js에 선언된 전역 변수 refreshingTokenPromise를
                // 직접 참조하는 대신, store.dispatch를 통해 처리하는 것이 Vuex 패턴에 맞습니다.
                // 아래 코드는 store action이 promise를 반환하고, 그 promise를 활용하는 방식입니다.

        // Vuex 스토어 외부의 refreshingTokenPromise 변수 대신,
        // 현재 진행 중인 재발급 요청이 있는지 확인하는 로직이 필요합니다.
        // 간단하게는 스토어 액션 내에서 Promise를 관리하거나, 스토어 상태 플래그를 사용합니다.
        // 아래는 store.dispatch가 Promise를 반환한다고 가정한 로직입니다.

        // 만약 store/index.js에 refreshingTokenPromise를 노출시키지 않았다면,
        // Vuex 상태(예: isRefreshingToken)를 사용하여 중복 호출을 방지할 수 있습니다.
        // 여기서는 store action이 promise를 반환하고, 이 promise를 공유하는 방식으로 구현합니다.

                // 외부 스코프의 refreshingTokenPromise 사용 (store/index.js 상단에 선언된)
                if (!window.refreshingTokenPromise){
                    window.refreshingTokenPromise = store.dispatch('refreshToken')
                }
            }

            try{
                const newAccessToken = await window.refreshingTokenPromise;     // 진행중인 재발급 프로미스 기다리기
                window.refreshingTokenPromise = null; // 재발급 완료 후 초기화 하기
                
                if(newAccessToken){
                    originalRequest.headers['Authorization'] = 'Bearer'+newAccessToken;
                    return apiClient(originalRequest);
                }
            }
            catch (refreshError){
                // 리프레시 토큰도 만료되었거나 다른 문제 발생 시 로그아웃 처리
                // store.dispatch('logout'); // 여기서 dispatch하면 순환 종속성 문제가 발생할 수 있습니다.
                // App.vue 등 최상위 컴포넌트에서 store의 authStatus를 감시하여 처리하는 것이 나을 수 있습니다.
                console.error('토큰 재발급 최종 실패, 로그아웃 필요:', refreshError);

                // 필요한 경우 로그인 페이지로 리디렉션
                // router.push('/login'); (api.js에서 router 직접 사용은 권장되지 않음)
                return Promise.reject(refreshError);
            }
        }
        //401 에러가 아니거나 재발급 요청이 실패한 경우에는 그대로 반환하기
        return Promise.reject(error);
    }
)


export default apiClient;
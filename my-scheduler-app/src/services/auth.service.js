import axios from 'axios';
import apiClient from './api'
// 이거는 실제 내 백엔드 주소로 변경해야함, https://localhost:8080/api/auth/ 처럼
const API_URL = '/api/auth/';

class AuthService { 
    login(userCredentials){
        // return apiClient.post(API_URL + 'signin',{
        //     username: userCredentials.username,
        //     password: userCredentials.password
        // });

        console.log('[AuthService]로그인 요청: ',userCredentials);  // <- 추후에 지울 부분

        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                if(userCredentials.username ==='testuser'&& userCredentials.password==='password'){
                    const fakeToken = 'fake-jwt-access-token'+Date.now();
                    const fakeUser = {
                        id:1,
                        username: userCredentials.username,
                        email: `${userCredentials.username}@example.com`,
                        accessToken : fakeToken,        //실제로는 백엔드에서 토큰을 발급하기
                    }
                    // 실제로는 백엔드가 HttpOnly 쿠키로 리프레시 토큰을 응답 헤더에 설정
                    resolve({data: fakeToken});
                }
                else{
                    reject({response: {data: {message:'Invalid Credentials'}}});
                }
            },500)          //0.5초 지연
        })
    }
    logout(){
        
        // return apiClient.post(API_URL + 'signout');
        // 실제로는 백엔드에서 HttpOnly 리프레시 토큰을 무효화하기
        // 클라이언트에서는 Vuex 상태와 로컬 저장된 액세스 토큰 등을 정리하기기

        console.log('[AuthService]로그아웃 요청');  // <- 추후에 지울 부분
        return Promise.resolve({data:{message:' Logout Successful'}});
    }

    // 여기에 register , refreshToken 등의 메소드를 추가할 수 있음
    


}

export default new AuthService();
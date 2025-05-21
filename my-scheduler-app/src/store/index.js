import Vue from 'vue'
import Vuex from 'vuex'
import authService from '@/services/auth.service';
Vue.use(Vuex)

// 여러 요청이 동시에 401을 받을 때 토큰 재발급 요청을 한 번만 보내기 위한 변수
let refreshingTokenPromise = null; 


export default new Vuex.Store({
  state: {
    accessToken : null, 
    user: null,
    isAuthenticated: false,
    authStatus: '',
  },
  
  mutations: {
    // 액세스 토큰 설정하기
    SET_ACCESS_TOKEN(state, token){
      state.accessToken = token;
    },
    // 액세스 토큰 비우기
    CLEAR_ACCESS_TOKEN(state){
      state.accessToken = null;
    },
    // 사용자 정보 설정
    SET_USER(state, userData){
      state.user = userData;
    },
    // 사용자 정보 비우기
    CLEAR_USER(state){
      state.user = null;
    },
    // 인증 상태 메세지 설정
    SET_AUTH_STATUS(state, status){
      state.authStatus= status;
    },
    // 인증 여부 설정
    SET_AUTHENTICATED(state, isAuthenticated){
      state.isAuthenticated = isAuthenticated;
    }
  },
  actions: {
    async login({ commit}, credentials){
      commit('SET_AUTH_STATUS','loading');
      try{
        const response = await authService.login(credentials);        
        // 백엔드 응답 형식에 따라 token과 user 정보를 추출하기
        // AuthService의 임시 응답은 response.data에 user 객체와 accessToken이 포함되어있음

        const userWithToken = response.data;
        
        if(userWithToken.accessToken){
          commit('SET_ACCESS_TOKEN', userWithToken.accessToken); // 액세스 토큰 저장
          const user ={id: userWithToken.id , username: userWithToken.username, email: userWithToken.email};
          commit('SET_USER', user); // 사용자 정보 저장
          commit('SET_AUTHENTICATED', true);
          commit('SET_AUTH_STATUS','success');
            // 백엔드는 HttpOnly쿠키로 리프레시 토큰 설정해야함
          return Promise.resolve(fakeUser);                // 로그인 성공하면 사용자 정보 반환
        }
        else{
          //임시  AuthService가 실패한 경우(실제로는 catch로 감)
          throw new Error(response.data.message|| '로그인 실패'); // 로그인 실패시 에러 발생
        }
      }
      catch(error){
        commit('SETAUTH_STATUS','error');       //에러 상태
        commit('CLEAR_ACCESS_TOKEN');       
        commit('CLEAR_USER');
        commit('SET_AUTHENTICATED', false);

        const errorMessage = error.response? error.response.data.message: '로그인 실패';
        console.error('로그인 실패', error);                      // <- 추후에 지울 부분

        //실제 에러 메세지를 반환하거나 처리할 때 여기
        return Promise.reject(error.response? error.response.data: '로그인 실패')
      }
    },


    // 로그아웃 액션
    async logout({commit}){
      try{
        await authService.logout(); // Authservice 호출해서 로그아웃
        // 백엔드에 현재 리프레시 토큰을 삭제.. 무효? 하도록 요청

      }
      catch(error){
        console.error('로그아웃 api 호출 실패',error);
        //로그아웃 요청 실패시에도 클라이언트 측 상태는 초기화하는 것이 일반적임
      }
      finally{
        commit('CLEAR_ACCESS_TOKEN'); 
        commit('CLEAR_USER');
        commit('SET_AUTHENTICATED', false);
        commit('SET_AUTH_STATUS','');
        
        refreshingTokenPromise = null; // 로그아웃 시 재발급 프로미스도 초기화
        console.log('로그아웃 처리 완료( 클라이언트 ) ');                      // <- 추후에 지울 부분
      }
      
      // 필요하면 localStorage에 저장된 관련 정보도 여기서 정리하기기    
      },


      async refreshToken({commit,state}){
        commit ('SET_AUTH_STATUS','refreshing');
        try{

          //AuthService에 refreshToken 메소트 호출( 백엔드 api 연동 필요)
          // 이 요청 시 브라우저는 HttpOnly 쿠키에 담긴 리프레시 토큰을 자동으로 전송
          const response = await authService.refreshToken(state.accessToken);
          const newAccessToken = response.data.accessToken;

          commit('SET_ACCESS_TOKEN', newAccessToken); // 새로운 액세스 토큰 저장
          commit('SET_AUTH_STATUS','success');
          commit('SET_AUTHENTICATED', true);
          return newAccessToken; // 새로운 액세스 토큰 반환
        }
        catch{
          console.error('리프레시 토큰 요청 실패', error);
          commit('SET_AUTH_STATUS','error');
          commit('CLEAR_ACCESS_TOKEN'); // 액세스 토큰 비우기
          commit('CLEAR_USER'); // 사용자 정보 비우기
          commit('SET_AUTHENTICATED', false); // 인증 상태 false로 설정
          refreshingTokenPromise =null;
          return Promise.reject(error);
        }
      }


      // TODO: 추후에 refeshToken이나 FetchUser 등 액션도 추가할 예정

    },




    getters: {
      isAuthenticated: state => state.isAuthenticated,
      currentUser: state=> state.user,
      authStatus: state=> state.authStatus,
      accestToken: state => state.accessToken
  
    },



  modules: {
    // 스토어가 복잡해지면 인증 관련 로직을 별도 모듈로 분리해서 관리하기
  }
})

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

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

        //api 호출은 여기에 구현하기. 
        // 지금은 api 연동 전이니까 임시로 성공 처리 했다고 하고 추후에 백엔드에서 Httponly쿠키로 리프레시 토큰을 받고
        // 응답으로  액세스 토큰이랑 사용자 정보를 받아와야한다고
        // 그러니 추후에 다시 손댈 필요가 있을 듯
        const fakeAccessToken = 'fake-jwt-access-token'+ Date.now();
        const fakeUser = {
          id:1,
          username: credentials.username ||'testUser',
          email: credentials.username? `${credentials.username}@example.com`: `testUser@example.com`, 
        };

        commit('SET_ACCESS_TOKEN', fakeAccessToken);
        commit('SET_USER',fakeUser);
        commit('SET_AUTHENTICATED', true);
        commit('SET_AUTH_STATUS','success');
        console.log('로그인 성공(임시)');                         // <- 추후에 지울 부분 
        return Promise.resolve(fakeUser);                // 로그인 성공하면 사용자 정보 반환
      }
      catch(error){
        commit('SETAUTH_STATUS','error');       //에러 상태
        commit('CLEAR_ACCESS_TOKEN');       
        commit('CLEAR_USER');
        commit('SET_AUTHENTICATED', false);
        console.error('로그인 실패', error);                      // <- 추후에 지울 부분

        //실제 에러 메세지를 반환하거나 처리할 때 여기
        return Promise.reject(error.response? error.response.data: '로그인 실패')
      }
    },


    // 로그아웃 액션
    async logout({commit}){

      // 여기서 실제 api 호출하기
      // 백엔드에 현재 리프레시 토큰을 삭제.. 무효? 하도록 요청

      commit('CLEAR_ACCESS_TOKEN'); 
      commit('CLEAR_USER');
      commit('SET_AUTHENTICATED', false);
      commit('SET_AUTH_STATUS','');
      console.log('로그아웃 성공');                      // <- 추후에 지울 부분
                                                        
      // 필요하면 localStorage에 저장된 관련 정보도 여기서 정리하기기    
      },
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

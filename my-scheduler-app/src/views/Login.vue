<template>
    <div class="login-conatiner">
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="username">사용자 이름:</label>
                <input type="text" id ="username" v-model="username" required/>
            </div>
            <div class="form-group">
                <label for="password">비밀번호:</label>
                <input type="password" id="password" v-model="password" required/>
            </div>
            <button type="submit" :disabled= "isLoading">
                {{ isLoading ? '로그인 중': '로그인' }}
            </button>
            <p v-if="authError" class= "error-message">{{authError}}</p>
        </form>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex';

    export default{
        name:'LoginView',
        data(){
            return {
                username:'',
                password:'',
            };
        },
        computed:{
            // authStatus를 통해 로딩 / 에러 상태 확인
            ...mapGetters(['autherStatus', isAuthenticated]),
            isLoading(){
                return this.autherStatus ==='loading';
            },
            authError(){

                // authStatus가 error일 때 표시할 메세지 ( 실제로는 더 구체적인 에러 메세지를 스토어에서 가져올 수 있음 )
                return this.authStatus ==='error' ? '아이디 혹은 비밀번호가 잘못되었습니다.': null;
            }
        },
        methods:{
            ...mapActions(['login']),   // Vuex의 login 액션 매핑
            async handledLogin(){
                if(!this.username || !this.password){
                    // 간단한 클라이언트 측 유효성 검사
                    alert('아이디와 비밀번호를 입력하세요.');
                    return;
                
                }
                try {
                    await this.login({username: this.username, password: this.password});

                    if(this.isAuthenticated){
                        
                        //로그인이 성공하면 다음 페이지로 이동 (대시보드 혹은 홈)
                        // this.$router.push('/');
                        alert('로그인 성공');

                        // 로그인 폼 초기화
                        this.username = '';
                        this.password = '';
                    }
                    else {
                        // login 액션 내에서 에러 처리가 되어 authError computed property가 업데이트됩니다.
                        // 이 부분은 login 액션이 reject하지 않고, 단순히 isAuthenticated가 false인 경우를 대비 (거의 발생 안 함)
                        if (!this.authError) alert('로그인에 실패했습니다. 다시 시도해주세요.');
                    }
                }
                catch(error){
                    // login 액션이 reject 되는 경우 ( 네트워크 오류 등 Vuex에서 처리 못한 에러)
                    console.error('로그인 중 오류 발생:', error);

                    // authError computed property가 이미 Vuex의 authStatus에 의해 업데이트 외었을 수 있음
                    if (!this.authError) alert('로그인 중 오류가 발생했습니다.');
                }
            
            }
        },
        watch:{

            isAuthenticated(newVal){
                if(isAuth){

                    //이미 로그인 한 상태에서 이 페이지에 접근한다면 리다이렉션( 선택 )
                    // this.$router.puch('/');
                    console.log('이미 로그인 한 상태입니다.');
                }
            }
        },
        created(){

            //컴포넌트 생성 시 이미 로그인된 상태라면 메인페이지로 리다이렉션 ( 선택 )
            if (this.isAuthenticated){
                //this.$route.push('/');
                console.log('이미 로그인 한 상태입니다.');
            }
        }
       
    }
</script>




<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #aaa;
}
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
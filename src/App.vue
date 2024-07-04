<template>
  <div id="app">
    <MenuBar @toggle-login-popup="toggleLoginPopup" />
    <router-view></router-view>
    <BoardPopup :visible="isLoginPopupVisible" @close="toggleLoginPopup">
      <div class="form-group">
        <h2>Login</h2>
        <input
          v-model="loginData.username"
          class="form-control mb-2"
          placeholder="Username"
        />
        <input
          type="password"
          v-model="loginData.password"
          class="form-control mb-2"
          placeholder="Password"
        />
      </div>
      <template v-slot:buttons>
        <button class="btn btn-primary" @click="login">Login</button>
        <button class="btn btn-secondary" @click="showRegisterPopup">
          Register
        </button>
      </template>
    </BoardPopup>
    <BoardPopup :visible="isRegisterPopupVisible" @close="toggleRegisterPopup">
      <div class="form-group">
        <h2>Register</h2>
        <input
          v-model="registerData.username"
          class="form-control mb-2"
          placeholder="Username"
        />
        <input
          type="password"
          v-model="registerData.password"
          class="form-control mb-2"
          placeholder="Password"
        />
        <input
          type="email"
          v-model="registerData.email"
          class="form-control mb-2"
          placeholder="Email"
        />
      </div>
      <template v-slot:buttons>
        <button class="btn btn-primary" @click="register">Register</button>
      </template>
    </BoardPopup>
  </div>
</template>
<script>
import MenuBar from "./components/MenuBar.vue";
import BoardPopup from "./components/Popup.vue";
import { ref } from "vue";
import { useStore } from "vuex";

export default {
  name: "App",
  components: {
    MenuBar,
    BoardPopup,
  },
  setup() {
    const isLoginPopupVisible = ref(false);
    const isRegisterPopupVisible = ref(false);
    const store = useStore();

    const loginData = ref({
      username: "",
      password: "",
    });
    const registerData = ref({ username: "", password: "", email: "" });

    const toggleLoginPopup = () => {
      isLoginPopupVisible.value = !isLoginPopupVisible.value;
    };

    const toggleRegisterPopup = () => {
      isRegisterPopupVisible.value = !isRegisterPopupVisible.value;
    };

    const login = async () => {
      try {
        await store.dispatch("login", loginData.value);
        toggleLoginPopup();
      } catch (error) {
        console.error(
          "Login failed:",
          error.response ? error.response.data.message : error.message
        );
      }
    };

    const register = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerData.value),
          }
        );
        if (!response.ok) throw new Error("Registration failed");
        toggleRegisterPopup();
      } catch (error) {
        console.error(error.message);
      }
    };

    const showRegisterPopup = () => {
      toggleLoginPopup();
      toggleRegisterPopup();
    };

    const logout = () => {
      store.commit("clearLastBoardId");
      store.dispatch("logout");
    };

    return {
      isLoginPopupVisible,
      isRegisterPopupVisible,
      toggleLoginPopup,
      toggleRegisterPopup,
      loginData,
      registerData,
      login,
      register,
      showRegisterPopup,
      logout,
    };
  },
};
</script>
<style>
body {
  background-color: rgb(78, 77, 77);
}
</style>

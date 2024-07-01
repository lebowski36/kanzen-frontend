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
        <!-- Add this line -->
      </template>
    </BoardPopup>
    <BoardPopup :visible="isRegisterPopupVisible" @close="toggleRegisterPopup">
      <!-- Add this popup -->
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

export default {
  name: "App",
  components: {
    MenuBar,
    BoardPopup,
  },
  setup() {
    const isLoginPopupVisible = ref(false);
    const isRegisterPopupVisible = ref(false); // Add this line
    const loginData = ref({
      username: "",
      password: "",
    });
    const registerData = ref({
      // Add this line
      username: "",
      password: "",
      email: "",
    });

    const toggleLoginPopup = () => {
      isLoginPopupVisible.value = !isLoginPopupVisible.value;
    };

    const toggleRegisterPopup = () => {
      // Add this function
      isRegisterPopupVisible.value = !isRegisterPopupVisible.value;
    };

    const login = () => {
      // Placeholder for login functionality
      console.log("Login data:", loginData.value);
      toggleLoginPopup();
    };

    const register = () => {
      // Add this function
      // Placeholder for registration functionality
      console.log("Register data:", registerData.value);
      toggleRegisterPopup();
    };

    const showRegisterPopup = () => {
      // Add this function
      toggleLoginPopup();
      toggleRegisterPopup();
    };

    return {
      isLoginPopupVisible,
      isRegisterPopupVisible, // Add this line
      toggleLoginPopup,
      toggleRegisterPopup, // Add this line
      loginData,
      registerData, // Add this line
      login,
      register, // Add this line
      showRegisterPopup, // Add this line
    };
  },
};
</script>

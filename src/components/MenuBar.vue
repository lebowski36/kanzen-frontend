<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand btn btn-outline-primary" @click="navigateToBoards"
        >Boards</a
      >
      <div class="ml-auto" v-if="user">
        <a
          class="navbar-brand btn btn-outline-primary"
          @click="navigateToProfile"
          >{{ user.username }}</a
        >
        <a class="navbar-brand btn btn-outline-danger" @click="logout"
          >Logout</a
        >
      </div>
      <div class="ml-auto" v-else>
        <a
          class="navbar-brand btn btn-outline-primary"
          @click="$emit('toggle-login-popup')"
          >Login</a
        >
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "MenuBar",
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);

    const navigateToBoards = () => {
      this.$router.push({ name: "BoardList" });
    };

    const navigateToProfile = () => {
      this.$router.push({ name: "UserProfile" });
    };

    const logout = () => {
      store.dispatch("logout");
    };

    return {
      user,
      navigateToBoards,
      navigateToProfile,
      logout,
    };
  },
};
</script>

<style scoped>
.navbar-brand {
  cursor: pointer;
  margin-right: auto; /* Ensures the Boards button stays on the left */
}
.container {
  padding-left: 15px;
  padding-right: 15px;
}
.navbar-nav .nav-link {
  margin-left: 10px;
}
.ml-auto {
  margin-left: auto; /* Ensures the Login button stays on the right */
}
</style>

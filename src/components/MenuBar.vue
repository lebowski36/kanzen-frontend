<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand btn btn-outline-primary" @click="navigateToBoards"
        >Boards</a
      >
      <div class="ml-auto">
        <a class="navbar-brand btn btn-outline-primary" @click="login">Login</a>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "MenuBar",
  methods: {
    navigateToBoards() {
      this.$router.push({ name: "BoardList" });
    },
    login() {
      // Placeholder for future login functionality
      console.log("Login button clicked");
    },
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

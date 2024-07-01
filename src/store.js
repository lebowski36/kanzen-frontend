import { createStore } from "vuex";
import axios from "./axios";

const store = createStore({
  state: {
    user: null,
    token: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setToken(state, token) {
      state.token = token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await axios.post("/auth/login", credentials);
      commit("setUser", response.data.user);
      commit("setToken", response.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    },
    logout({ commit }) {
      commit("logout");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
});

export default store;

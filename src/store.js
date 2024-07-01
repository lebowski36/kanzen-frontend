// store.js

import { createStore } from "vuex";
import axios from "./axios";

// Load state from local storage if available
const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const store = createStore({
  state: {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    boards: [],
    tickets: [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    setBoards(state, boards) {
      state.boards = boards;
    },
    setTickets(state, tickets) {
      state.tickets = tickets;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.boards = [];
      state.tickets = [];
      localStorage.removeItem("user");
      localStorage.removeItem("token");
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
    async fetchUserBoards({ state }) {
      if (state.token) {
        return axios.get("/boards");
      }
    },
    async fetchUserTickets({ state }, boardId) {
      if (state.token) {
        return axios.get(`/tickets/board/${boardId}`);
      }
    },
  },
});

export default store;

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
    setLastBoardId(state, boardId) {
      localStorage.setItem("lastBoardId", boardId);
    },
    clearLastBoardId() {
      localStorage.removeItem("lastBoardId");
    },
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      const response = await axios.post("/auth/login", credentials);
      commit("setUser", response.data.user);
      commit("setToken", response.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      await dispatch("fetchUserBoards");

      const boardId = localStorage.getItem("lastBoardId");
      if (boardId) {
        try {
          await dispatch("fetchBoardData", boardId);
          await dispatch("fetchBoardTickets", boardId);
        } catch (error) {
          console.error("Error fetching board data after login:", error);
        }
      }
    },
    async fetchBoardData({ commit }, boardId) {
      try {
        const response = await axios.get(`/boards/${boardId}`);
        commit("setBoards", [response.data]);
      } catch (error) {
        console.error("Error fetching board data:", error);
      }
    },

    async fetchBoardTickets({ commit }, boardId) {
      try {
        const response = await axios.get(`/tickets/board/${boardId}`);
        commit("setTickets", response.data);
      } catch (error) {
        console.error("Error fetching board tickets:", error);
      }
    },

    logout({ commit }) {
      commit("logout");
      delete axios.defaults.headers.common["Authorization"];
    },
    async fetchUserBoards({ commit }) {
      try {
        const response = await axios.get("/boards");
        commit("setBoards", response.data);
      } catch (error) {
        console.error("Error fetching user boards:", error);
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

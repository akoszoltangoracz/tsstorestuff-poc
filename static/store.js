const store = new Vuex.Store({
  state: {
    files: {
      list: [],
    },
  },
  mutations: {
    setFiles(state, files) {
      state.files.list = files;
    },
  },
  actions: {
    async listFiles({ commit }) {
      const { data } = await axios.get('/api/files');

      commit('setFiles', data);
    },

  },
});

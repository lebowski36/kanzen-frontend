<template>
  <div class="container">
    <div class="header">
      <h1 class="my-4">Boards</h1>
      <ActionButtons
        :isDeleteMode="isDeleteMode"
        @add="showPopup"
        @delete="toggleDeleteMode"
      />
    </div>
    <div class="board-list">
      <div
        v-for="board in boards"
        :key="board._id"
        :class="['board-item', { 'delete-mode': isDeleteMode }]"
        @click="
          isDeleteMode ? confirmDelete(board._id) : navigateToBoard(board._id)
        "
      >
        <div class="board-link">{{ board.name }}</div>
      </div>
    </div>

    <BoardPopup :visible="isPopupVisible" @close="hidePopup">
      <div class="form-group">
        <h2>Create a new Board</h2>
        <input
          v-model="newBoard.name"
          class="form-control mb-2"
          placeholder="Board Name"
        />
        <input
          v-model="newBoard.description"
          class="form-control mb-2"
          placeholder="Board Description"
        />
        <input
          v-model="newBoard.prefix"
          class="form-control mb-2"
          placeholder="Board Prefix"
          maxlength="5"
        />
        <div class="status-management">
          <h3>Manage statuses</h3>
          <div
            v-for="(column, index) in newBoard.columns"
            :key="index"
            class="status-item"
            draggable="true"
            @dragstart="dragStart(column, index)"
            @dragenter="dragEnter($event, index)"
            @dragover="dragOver"
            @drop="dropStatus($event, newBoard.columns, updateColumns)"
          >
            <input v-model="newBoard.columns[index]" />
          </div>

          <button @click="addStatus" class="btn btn-secondary">
            Add statuses
          </button>
        </div>
      </div>
      <template v-slot:buttons>
        <button @click="createBoard" class="btn btn-primary">
          Create Board
        </button>
      </template>
    </BoardPopup>

    <BoardPopup :visible="isDeletePopupVisible" @close="hideDeletePopup">
      <div class="form-group">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this board?</p>
      </div>
      <template v-slot:buttons>
        <button @click="deleteBoard" class="btn btn-danger">Delete</button>
        <button @click="hideDeletePopup" class="btn btn-secondary">
          Cancel
        </button>
      </template>
    </BoardPopup>
  </div>
</template>

<script>
import axios from "../axios";
import BoardPopup from "../components/Popup.vue";
import { useRouter } from "vue-router";
import ActionButtons from "../components/ActionButtons.vue";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { ref } from "vue";

export default {
  components: {
    ActionButtons,
    BoardPopup,
  },
  data() {
    return {
      boards: [],
      isPopupVisible: false,
      isDeleteMode: false,
      isDeletePopupVisible: false,
      boardToDelete: null,
    };
  },
  setup() {
    const router = useRouter();
    const { dragStart, dragEnter, dragOver, dropStatus } = useDragAndDrop();

    const navigateToBoard = (boardId) => {
      router.push({ name: "BoardView", params: { id: boardId } });
    };

    const newBoard = ref({
      name: "",
      description: "",
      prefix: "",
      columns: ["To Do", "In Progress", "Done"],
    });

    const updateColumns = (newColumns) => {
      newBoard.value.columns = newColumns;
    };

    return {
      navigateToBoard,
      dragStart,
      dragEnter,
      dragOver,
      dropStatus,
      newBoard,
      updateColumns,
    };
  },
  created() {
    if (this.$store.state.boards.length === 0) {
      this.$store.dispatch("fetchUserBoards");
    } else {
      this.boards = this.$store.state.boards;
    }
  },
  computed: {
    storeBoards() {
      return this.$store.state.boards;
    },
  },
  watch: {
    storeBoards(newBoards) {
      this.boards = newBoards;
    },
  },

  methods: {
    addStatus() {
      this.newBoard.columns.push("New Column");
    },
    showPopup() {
      this.isPopupVisible = true;
    },
    hidePopup() {
      this.isPopupVisible = false;
    },
    toggleDeleteMode() {
      this.isDeleteMode = !this.isDeleteMode;
    },
    confirmDelete(boardId) {
      this.boardToDelete = boardId;
      this.isDeletePopupVisible = true;
    },
    hideDeletePopup() {
      this.isDeletePopupVisible = false;
      this.boardToDelete = null;
    },
    createBoard() {
      axios
        .post("/boards", this.newBoard)
        .then((response) => {
          this.boards.push(response.data);
          this.newBoard.name = "";
          this.newBoard.description = "";
          this.newBoard.prefix = "";
          this.hidePopup();
        })
        .catch((error) => {
          console.error("There was an error creating the board:", error);
        });
    },
    deleteBoard() {
      axios
        .delete(`/boards/${this.boardToDelete}`)
        .then(() => {
          this.boards = this.boards.filter(
            (board) => board._id !== this.boardToDelete
          );
          this.hideDeletePopup();
        })
        .catch((error) => {
          console.error("There was an error deleting the board:", error);
        });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #f0f4f8;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
}

.header h1 {
  margin: 0;
  margin-right: 10px;
}

.add-board-btn,
.delete-board-btn {
  margin-left: 10px;
  font-size: 1.5rem;
  background: #fff;
  border: 2px solid #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.add-board-btn:hover,
.delete-board-btn:hover {
  background: #e0e0e0;
}

.board-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.board-item {
  background: #e6eff7;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.board-item:hover {
  transform: translateY(-5px);
}

.board-item.delete-mode:hover {
  background: #f8d7da;
}

.board-link {
  text-decoration: none;
  font-size: 1.2rem;
  color: #333;
}

.board-link:hover {
  text-decoration: underline;
}

.status-management {
  margin-top: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  background: #fff;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.status-item input {
  flex: 1;
  margin-right: 10px;
  padding: 5px;
}

.status-item.dragging {
  background: #e0e0e0;
}
</style>

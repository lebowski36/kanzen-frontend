<template>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <h1 class="my-4">{{ board.name }}</h1>
      <ActionButtons
        :isDeleteMode="isDeleteMode"
        @add="showTicketView"
        @edit="showEditPopup"
        @delete="toggleDeleteMode"
      />
    </div>

    <!-- Board Description -->
    <p v-html="board.description" class="board-description"></p>

    <!-- Columns and Tickets -->
    <div class="board-columns">
      <div
        v-for="column in board.columns"
        :key="column"
        class="board-column"
        @dragover.prevent="dragOver($event)"
        @drop="handleDrop($event, column)"
      >
        <h2>{{ column }}</h2>
        <div
          v-for="(ticket, index) in getTicketsByColumn(column)"
          :key="ticket._id"
          class="card my-2 p-2 ticket-card"
          :class="{ 'delete-mode': isDeleteMode }"
          draggable="true"
          @dragstart="dragStart(ticket, index)"
          @dragenter.prevent="dragEnter($event, index)"
          @dragover.prevent="dragOver"
          @drop="handleDrop($event, column)"
          @click="isDeleteMode ? confirmDelete(ticket._id) : openTicket(ticket)"
        >
          <h3>{{ ticket.title || "Untitled" }}</h3>
          <span class="ticket-number">#{{ ticket.ticketNumber }}</span>
        </div>
      </div>
    </div>

    <!-- Ticket Input Modal -->
    <TicketView
      v-if="isTicketViewVisible"
      :ticket="currentTicket"
      :board-id="board._id"
      :status-options="board.columns"
      @close="hideTicketView"
      @save="saveTicket"
    />

    <!-- Delete Confirmation Popup -->
    <BoardPopup :visible="isDeletePopupVisible" @close="hideDeletePopup">
      <div class="form-group">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this ticket?</p>
      </div>
      <template v-slot:buttons>
        <button @click="deleteTicket" class="btn btn-danger">Delete</button>
        <button @click="hideDeletePopup" class="btn btn-secondary">
          Cancel
        </button>
      </template>
    </BoardPopup>
    <BoardPopup :visible="isEditPopupVisible" @close="handleEditPopupClose">
      <div class="form-group">
        <h2>Edit Board</h2>
        <input
          v-model="board.name"
          class="form-control mb-2"
          placeholder="Board Name"
        />
        <div class="status-management">
          <h3>Manage statuses</h3>
          <div
            v-for="(column, index) in board.columns"
            :key="index"
            class="status-item"
            draggable="true"
            @dragstart="dragStart(column, index)"
            @dragenter="dragEnter($event, index)"
            @dragover="dragOver"
            @drop="dropStatus($event, board.columns, updateColumns)"
          >
            <input v-model="board.columns[index]" :disabled="true" />
            <button
              @click="deleteColumn(index)"
              :disabled="hasTickets(column)"
              class="btn btn-danger"
            >
              Delete
            </button>
          </div>
          <div class="new-status-item" v-if="isAddingColumn">
            <input v-model="newColumnName" placeholder="Enter column name" />
            <button @click="confirmAddColumn" class="btn btn-primary">
              Add
            </button>
            <button @click="cancelAddColumn" class="btn btn-secondary">
              Cancel
            </button>
          </div>
          <button @click="startAddingColumn" v-else class="btn btn-secondary">
            Add Column
          </button>
        </div>
      </div>
      <template v-slot:buttons>
        <button @click="saveBoardChanges" class="btn btn-primary">
          Save Changes
        </button>
      </template>
    </BoardPopup>
  </div>
</template>

<script>
// Import necessary components and libraries
import axios from "../axios";
import BoardPopup from "../components/Popup.vue";
import ActionButtons from "../components/ActionButtons.vue";
import TicketView from "../components/TicketView.vue";
import { useDragAndDrop } from "../hooks/useDragAndDrop";

export default {
  components: {
    ActionButtons,
    BoardPopup,
    TicketView,
  },

  data() {
    return {
      statusOptions: [],
      draggedTicket: null,
      board: {
        columns: [],
      },
      tickets: [],
      currentTicket: {
        title: "",
        status: "To Do",
        ticketNumber: null,
      },
      isTicketViewVisible: false,
      isDeleteMode: false,
      isDeletePopupVisible: false,
      ticketToDelete: null,
      isEditPopupVisible: false,
      isAddingColumn: false,
      newColumnName: "",
    };
  },

  created() {
    const boardId = this.$route.params.id;
    this.$store.commit("setLastBoardId", boardId);
    if (this.$store.state.user) {
      this.fetchBoardData();
      this.fetchTickets(boardId);
    }

    const ticketNumber = this.$route.query.ticketNumber;
    if (ticketNumber) {
      this.fetchSingleTicket(ticketNumber);
    }
  },
  watch: {
    "$store.state.user"(newUser) {
      if (newUser) {
        const boardId = this.$route.params.id;
        this.fetchBoardData();
        this.fetchTickets(boardId);
      }
    },
  },

  setup() {
    const { dragStart, dragEnter, dragOver, drop, dropStatus } =
      useDragAndDrop();
    return {
      dragStart,
      dragEnter,
      dragOver,
      drop,
      dropStatus,
    };
  },

  methods: {
    // Fetch board data from the server
    fetchBoardData() {
      const boardId = this.$route.params.id;
      const board = this.$store.state.boards.find((b) => b._id === boardId);
      if (board) {
        this.board = board;
        this.statusOptions = board.columns;
      } else {
        axios
          .get(`/boards/${boardId}`)
          .then((response) => {
            const boardData = response.data || {};
            boardData.columns = boardData.columns || [];
            this.board = boardData;
            this.statusOptions = boardData.columns;
          })
          .catch((error) => {
            console.error("There was an error fetching the board:", error);
            this.board = { columns: [] };
          });
      }
    },

    // Fetch tickets data from the server
    fetchTickets(id) {
      axios
        .get(`/tickets/board/${id}`)
        .then((response) => {
          this.tickets = response.data;
        })
        .catch((error) => {
          console.error("There was an error fetching the tickets:", error);
        });
    },
    fetchSingleTicket(ticketNumber) {
      axios
        .get(`/tickets/${ticketNumber}`)
        .then((response) => {
          this.showTicketView(response.data);
        })
        .catch((error) => {
          console.error("There was an error fetching the ticket:", error);
        });
    },

    // Show the ticket input modal
    openTicket(ticket) {
      this.showTicketView(ticket);
      this.$router.push({
        query: { ticketNumber: ticket.ticketNumber, fullscreen: false },
      });
    },

    // Update showTicketView to handle URL state
    showTicketView(ticket = null) {
      if (ticket) {
        this.currentTicket = { ...ticket };
        this.$router.push({
          query: {
            ticketNumber: ticket.ticketNumber,
            fullscreen: this.$route.query.fullscreen || false,
          },
        });
      } else {
        this.currentTicket = {
          title: "",
          status: "To Do",
          ticketNumber: null,
        };
      }
      this.isTicketViewVisible = true;
    },

    // Hide the ticket input modal and remove the ticketNumber from the URL
    hideTicketView() {
      this.isTicketViewVisible = false;
      this.$router.push({
        query: { ticketNumber: undefined, fullscreen: undefined },
      });
    },

    // Save ticket (create new or update existing)
    saveTicket(ticket) {
      ticket.board = this.board._id; // Ensure the board ID is included
      if (ticket._id) {
        axios
          .put(`/tickets/${ticket._id}`, ticket)
          .then(() => {
            this.tickets = this.tickets.map((t) =>
              t._id === ticket._id ? ticket : t
            );
            this.hideTicketView();
          })
          .catch((error) => {
            console.error("There was an error updating the ticket:", error);
          });
      } else {
        axios
          .post("/tickets", ticket)
          .then((response) => {
            this.tickets.push(response.data);
            this.hideTicketView();
          })
          .catch((error) => {
            console.error("There was an error creating the ticket:", error);
          });
      }
    },
    showEditPopup() {
      this.isEditPopupVisible = true;
    },
    hasTickets(column) {
      return this.tickets.some((ticket) => ticket.status === column);
    },
    deleteColumn(index) {
      this.board.columns.splice(index, 1);
    },
    startAddingColumn() {
      this.isAddingColumn = true;
    },
    cancelAddColumn() {
      this.isAddingColumn = false;
      this.newColumnName = "";
    },
    confirmAddColumn() {
      if (this.newColumnName.trim()) {
        this.board.columns.push(this.newColumnName.trim());
        this.newColumnName = "";
        this.isAddingColumn = false;
      }
    },
    updateColumns(newColumns) {
      this.board.columns = newColumns;
    },
    saveBoardChanges() {
      this.$store
        .dispatch("updateBoard", this.board)
        .then(() => this.hideEditPopup())
        .catch((error) => console.error("Error saving board changes:", error));
    },
    hideEditPopup() {
      this.isEditPopupVisible = false;
    },
    handleEditPopupClose() {
      this.hideEditPopup();
      this.refetchBoardData();
    },
    refetchBoardData() {
      const boardId = this.$route.params.id;
      axios
        .get(`/boards/${boardId}`)
        .then((response) => {
          const boardData = response.data || {};
          boardData.columns = boardData.columns || [];
          this.board = boardData;
          this.statusOptions = boardData.columns;
        })
        .catch((error) => {
          console.error("There was an error fetching the board:", error);
          this.board = { columns: [] };
        });
    },

    addColumn() {
      this.board.columns.push("New Column");
    },

    // Toggle delete mode on/off
    toggleDeleteMode() {
      this.isDeleteMode = !this.isDeleteMode;
    },

    // Confirm delete action
    confirmDelete(ticketId) {
      this.ticketToDelete = ticketId;
      this.isDeletePopupVisible = true;
    },

    // Hide delete confirmation popup
    hideDeletePopup() {
      this.isDeletePopupVisible = false;
      this.ticketToDelete = null;
    },

    // Delete ticket
    deleteTicket() {
      axios
        .delete(`/tickets/${this.ticketToDelete}`)
        .then(() => {
          this.tickets = this.tickets.filter(
            (ticket) => ticket._id !== this.ticketToDelete
          );
          this.hideDeletePopup();
        })
        .catch((error) => {
          console.error("There was an error deleting the ticket:", error);
        });
    },

    // Get tickets by column
    getTicketsByColumn(column) {
      return (
        this.tickets.filter(
          (ticket) => ticket.status === column && !ticket.deleted
        ) || []
      );
    },

    handleDrop(event, column) {
      const updateCallback = (items, updatedItem) => {
        this.tickets = items;
        axios
          .put(`/tickets/${updatedItem._id}`, { status: column })
          .catch((error) => {
            console.error("There was an error updating the ticket:", error);
          });
      };
      this.drop(this.tickets, column, updateCallback);
    },
  },
};
</script>

<style scoped>
/* General Container Styles */
.container {
  max-width: 2000px;
  margin: 0 auto;
  padding: 20px;
  background: #343a40;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Header Styles */
.header {
  display: flex;
  align-items: center;
}

.header h1 {
  margin: 0;
  margin-right: 10px;
}

.add-ticket-btn,
.delete-ticket-btn {
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

.add-ticket-btn:hover,
.delete-ticket-btn:hover {
  background: #e0e0e0;
}

/* Board Column Styles */
.board-columns {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  background: #495057;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.board-column {
  flex: 1;
  min-width: 00px;
  padding: 20px;
  border-radius: 10px;
  transition: background-color 0.3s ease;
  background-color: #6c757d;
}

.board-column h2::before {
  content: "📝";
  margin-right: 10px;
  font-size: 1.2em;
}

/* Ticket Card Styles */
.ticket-card {
  background: #adb5bd;
  border: 1px solid #6c757d;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 10px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.ticket-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.ticket-card h3 {
  font-size: 1.25em;
  margin-bottom: 10px;
}

.ticket-number {
  display: block;
  margin-top: 10px;
  font-size: 0.9rem;
  color: rgb(0, 0, 0);
}

.my-4,
.board-description {
  color: white;
}
</style>

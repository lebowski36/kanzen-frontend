<template>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <h1 class="my-4">{{ board.name }}</h1>
      <ActionButtons
        :isDeleteMode="isDeleteMode"
        @add="showTicketInput"
        @delete="toggleDeleteMode"
      />
    </div>

    <!-- Board Description -->
    <p v-html="board.description"></p>

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
        >
          <h3>{{ ticket.title || "Untitled" }}</h3>
          <span class="ticket-number">#{{ ticket.ticketNumber }}</span>
        </div>
      </div>
    </div>

    <!-- Ticket Input Modal -->
    <TicketInput
      v-if="isTicketInputVisible"
      :ticket="currentTicket"
      :board-id="board._id"
      :status-options="board.columns"
      @close="hideTicketInput"
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
  </div>
</template>

<script>
// Import necessary components and libraries
import axios from "../axios";
import BoardPopup from "../components/Popup.vue";
import ActionButtons from "../components/ActionButtons.vue";
import TicketInput from "../components/TicketInput.vue";
import { useDragAndDrop } from "../hooks/useDragAndDrop";

export default {
  components: {
    ActionButtons,
    BoardPopup,
    TicketInput,
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
      isTicketInputVisible: false,
      isDeleteMode: false,
      isDeletePopupVisible: false,
      ticketToDelete: null,
    };
  },
  created() {
    const boardId = this.$route.params.id;
    this.fetchBoardData(boardId);
    this.fetchTickets(boardId);

    const ticketNumber = this.$route.query.ticketNumber;
    if (ticketNumber) {
      this.fetchSingleTicket(ticketNumber);
    }
  },
  setup() {
    const { dragStart, dragEnter, dragOver, drop } = useDragAndDrop();
    return {
      dragStart,
      dragEnter,
      dragOver,
      drop,
      // Other data and methods
    };
  },

  methods: {
    // Fetch board data from the server
    fetchBoardData(id) {
      axios
        .get(`/boards/${id}`)
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
          this.showTicketInput(response.data);
        })
        .catch((error) => {
          console.error("There was an error fetching the ticket:", error);
        });
    },

    // Show the ticket input modal
    showTicketInput(ticket = null) {
      if (ticket) {
        this.currentTicket = { ...ticket };
        this.$router.push({ query: { ticketNumber: ticket.ticketNumber } });
      } else {
        this.currentTicket = {
          title: "",
          status: "To Do",
          ticketNumber: null,
        };
      }
      this.isTicketInputVisible = true;
    },

    // Hide the ticket input modal and remove the ticketNumber from the URL
    hideTicketInput() {
      this.isTicketInputVisible = false;
      this.$router.push({ query: { ticketNumber: undefined } });
    },

    // Save ticket (create new or update existing)
    saveTicket(ticket) {
      if (ticket._id) {
        axios
          .put(`/tickets/${ticket._id}`, ticket)
          .then(() => {
            this.tickets = this.tickets.map((t) =>
              t._id === ticket._id ? ticket : t
            );
            this.hideTicketInput();
          })
          .catch((error) => {
            console.error("There was an error updating the ticket:", error);
          });
      } else {
        axios
          .post("/tickets", ticket)
          .then((response) => {
            this.tickets.push(response.data);
            this.hideTicketInput();
          })
          .catch((error) => {
            console.error("There was an error creating the ticket:", error);
          });
      }
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f0f4f8;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.board-column {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.board-column:nth-child(1) {
  background-color: #e6eff7;
  border-left: 5px solid rgba(0, 123, 255, 0.2);
}

.board-column:nth-child(2) {
  background-color: #f0f9e8;
  border-left: 5px solid rgba(40, 167, 69, 0.2);
}

.board-column:nth-child(3) {
  background-color: #fff5f5;
  border-left: 5px solid rgba(220, 53, 69, 0.2);
}

.board-column h2::before {
  content: "📝";
  margin-right: 10px;
  font-size: 1.2em;
}

/* Ticket Card Styles */
.ticket-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 10px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.ticket-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.ticket-card h3 {
  font-size: 1.25em;
  margin-bottom: 10px;
}

.ticket-number {
  display: block;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #888;
}
</style>

<template>
  <div class="container">
    <div class="header">
      <h1 class="my-4">{{ board.name }}</h1>
      <ActionButtons
        :isDeleteMode="isDeleteMode"
        @add="showPopup"
        @delete="toggleDeleteMode"
      />
    </div>
    <p>{{ board.description }}</p>
    <div class="board-columns">
      <div
        v-for="column in board.columns"
        :key="column"
        class="board-column"
        @dragover.prevent
        @drop="drop($event, column)"
      >
        <h2>{{ column }}</h2>
        <div
          v-for="ticket in getTicketsByColumn(column)"
          :key="ticket._id"
          class="card my-2 p-2 ticket-card"
          :class="{ 'delete-mode': isDeleteMode }"
          draggable="true"
          @dragstart="dragStart(ticket)"
          @click="isDeleteMode ? confirmDelete(ticket._id) : editTicket(ticket)"
        >
          <h3>{{ ticket.title || "Untitled" }}</h3>
          <p v-html="ticket.description || 'No description'"></p>
          <span class="ticket-number">#{{ ticket.ticketNumber }}</span>
        </div>
      </div>
    </div>

    <BoardPopup
      :visible="isPopupVisible"
      @close="hidePopup"
      :content="currentTicket.description"
      @update:content="updateDescription"
      :statusOptions="board.columns"
      :selectedStatus="currentTicket.status"
      @update:status="updateStatus"
      :quillEnabled="true"
    >
      <template #default>
        <div class="form-group">
          <h2>{{ editMode ? "Edit Ticket" : "Create a new Ticket" }}</h2>
          <label for="ticketTitle">Title</label>
          <input
            id="ticketTitle"
            v-model="currentTicket.title"
            class="form-control mb-2"
            placeholder="Ticket Title"
          />
          <label for="ticketStatus">Status</label>
          <multiselect
            v-model="currentTicket.status"
            :options="board.columns"
            :multiple="false"
            :close-on-select="true"
            placeholder="Select status"
            label="status"
            track-by="status"
          />
          <div v-if="editMode" class="form-control mb-2">
            Ticket Number: #{{ currentTicket.ticketNumber }}
          </div>
        </div>
      </template>
      <template #buttons>
        <button
          @click="editMode ? updateTicket() : createTicket()"
          class="btn btn-primary"
        >
          {{ editMode ? "Update Ticket" : "Create Ticket" }}
        </button>
      </template>
    </BoardPopup>

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
import axios from "../axios";
import BoardPopup from "../components/Popup.vue";
import ActionButtons from "../components/ActionButtons.vue";
import Multiselect from "vue-multiselect";

export default {
  components: {
    ActionButtons,
    BoardPopup,
    Multiselect,
  },
  data() {
    return {
      statusOptions: [],
      draggedTicket: null,
      board: {
        columns: [], // Initialize columns to prevent undefined error
      },
      tickets: [],
      currentTicket: {
        title: "",
        description: "",
        status: "To Do",
        ticketNumber: null,
      },
      editMode: false,
      isPopupVisible: false,
      isDeleteMode: false,
      isDeletePopupVisible: false,
      ticketToDelete: null,
    };
  },
  created() {
    const id = this.$route.params.id;
    axios
      .get(`/boards/${id}`)
      .then((response) => {
        const boardData = response.data || {};
        boardData.columns = boardData.columns || []; // Ensure columns is an array
        this.board = boardData;
        this.statusOptions = boardData.columns; // Set statusOptions here
      })
      .catch((error) => {
        console.error("There was an error fetching the board:", error);
        this.board = { columns: [] }; // Ensure board has columns array
      });

    axios
      .get(`/tickets/board/${id}`)
      .then((response) => {
        this.tickets = response.data;
      })
      .catch((error) => {
        console.error("There was an error fetching the tickets:", error);
      });
  },
  methods: {
    showPopup() {
      this.editMode = false;
      this.currentTicket = {
        title: "",
        description: "",
        status: "To Do",
        ticketNumber: null,
      };
      this.isPopupVisible = true;
    },
    hidePopup() {
      this.isPopupVisible = false;
    },
    toggleDeleteMode() {
      this.isDeleteMode = !this.isDeleteMode;
    },
    confirmDelete(ticketId) {
      this.ticketToDelete = ticketId;
      this.isDeletePopupVisible = true;
    },
    hideDeletePopup() {
      this.isDeletePopupVisible = false;
      this.ticketToDelete = null;
    },
    createTicket() {
      const ticketData = {
        title: this.currentTicket.title,
        description: this.currentTicket.description,
        status: this.currentTicket.status,
        board: this.board._id,
      };
      axios
        .post("/tickets", ticketData)
        .then((response) => {
          this.tickets.push(response.data);
          this.hidePopup();
        })
        .catch((error) => {
          console.error("There was an error creating the ticket:", error);
        });
    },
    editTicket(ticket) {
      this.editMode = true;
      this.currentTicket = { ...ticket };
      this.isPopupVisible = true;
    },
    updateDescription(content) {
      this.currentTicket.description = content;
    },
    updateStatus(status) {
      this.currentTicket.status = status;
    },

    updateTicket() {
      const updatedTicket = {
        ...this.currentTicket,
        description: this.currentTicket.description,
      };
      axios
        .put(`/tickets/${updatedTicket._id}`, updatedTicket)
        .then(() => {
          this.tickets = this.tickets.map((ticket) =>
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          );
          this.hidePopup();
        })
        .catch((error) => {
          console.error("There was an error updating the ticket:", error);
        });
    },
    deleteTicket() {
      axios
        .delete(`/tickets/${this.ticketToDelete}`)
        .then(() => {
          this.tickets = this.tickets.map((ticket) =>
            ticket._id === this.ticketToDelete
              ? { ...ticket, deleted: true }
              : ticket
          );
          this.hideDeletePopup();
        })
        .catch((error) => {
          console.error("There was an error deleting the ticket:", error);
        });
    },
    getTicketsByColumn(column) {
      return (
        this.tickets.filter(
          (ticket) => ticket.status === column && !ticket.deleted
        ) || []
      );
    },
    dragStart(ticket) {
      this.draggedTicket = ticket;
    },
    drop(event, column) {
      const updatedTicket = { ...this.draggedTicket, status: column };
      axios
        .put(`/tickets/${updatedTicket._id}`, { status: column })
        .then(() => {
          this.tickets = this.tickets.map((ticket) =>
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          );
          this.draggedTicket = null;
        })
        .catch((error) => {
          console.error("There was an error updating the ticket:", error);
        });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
  background: #e6eff7;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

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

.ticket-card.delete-mode:hover {
  background: #f8d7da;
}

.ticket-number {
  display: block;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #888;
}
</style>

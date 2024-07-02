<template>
  <div :class="['ticket-input-overlay', { fullscreen: isFullscreen }]">
    <div :class="['ticket-input-content', { fullscreen: isFullscreen }]">
      <button class="close-btn" @click="close">x</button>
      <div class="ticket-input-body">
        <div class="form-group">
          <h2>{{ isEditMode ? "Edit Ticket" : "Create a new Ticket" }}</h2>
          <label for="ticketTitle">Title</label>
          <input
            id="ticketTitle"
            v-model="localTicket.title"
            class="form-control mb-2"
            placeholder="Ticket Title"
          />
          <label for="ticketDescription">Description</label>
          <div ref="quillToolbar"></div>
          <div ref="quillEditorContainer"></div>
          <label for="ticketStatus">Status</label>
          <select
            id="ticketStatus"
            v-model="localTicket.status"
            class="form-control mb-2"
          >
            <option
              v-for="status in statusOptions"
              :key="status"
              :value="status"
            >
              {{ status }}
            </option>
          </select>
          <div v-if="isEditMode" class="form-control mb-2">
            Ticket Number: #{{ localTicket.ticketNumber }}
          </div>
        </div>
      </div>
      <div class="ticket-input-buttons">
        <button @click="saveTicket" class="btn btn-primary">
          {{ isEditMode ? "Update Ticket" : "Create Ticket" }}
        </button>
        <button @click="toggleFullscreen" class="btn btn-secondary">
          {{ isFullscreen ? "Exit Fullscreen" : "Fullscreen" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default {
  name: "TicketView",
  props: {
    ticket: {
      type: Object,
      default: () => ({
        title: "",
        description: "",
        status: "To Do",
        ticketNumber: null,
        board: null,
      }),
    },
    boardId: {
      type: String,
      required: true,
    },
    statusOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localTicket: {
        ...this.ticket,
        board: this.boardId,
        description: this.ticket.description || "",
      },

      isEditMode: !!this.ticket._id,
      isFullscreen: this.$route.query.fullscreen === "true",
    };
  },
  mounted() {
    this.initializeQuill();
    if (!this.isEditMode) {
      this.localTicket.status = this.statusOptions.length
        ? this.statusOptions[0]
        : "";
    }
  },
  watch: {
    ticket: {
      handler(newTicket) {
        this.localTicket = { ...newTicket, board: this.boardId };
        if (this.quillEditor) {
          this.quillEditor.root.innerHTML = newTicket.description;
        }
      },
      deep: true,
    },
  },
  methods: {
    initializeQuill() {
      const quillToolbar = document.createElement("div");
      this.$refs.quillToolbar.appendChild(quillToolbar);

      this.quillEditor = new Quill(this.$refs.quillEditorContainer, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
          ],
        },
      });

      this.quillEditor.root.innerHTML = this.localTicket.description;
      this.quillEditor.on("text-change", () => {
        this.localTicket.description = this.quillEditor.root.innerHTML;
      });
    },
    close() {
      this.$emit("close");
    },
    saveTicket() {
      this.localTicket.board = this.boardId; // Ensure boardId is included in the ticket data
      this.$emit("save", this.localTicket);
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      this.$router.push({
        query: { ...this.$route.query, fullscreen: this.isFullscreen },
      });
    },
  },
};
</script>

<style scoped>
.ticket-input-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.ticket-input-overlay.fullscreen {
  background: white;
  padding: 0;
  height: 100vh;
}

.ticket-input-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  max-width: 100%;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.ticket-input-content.fullscreen {
  width: 100%;
  height: 100%;
  border-radius: 0;
  box-shadow: none;
  padding: 20px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.close-btn:hover {
  color: #333;
}

.ticket-input-body {
  margin-bottom: 20px;
}

.ticket-input-body .ql-container {
  height: 200px; /* Approx. 8 rows */
  overflow-y: auto;
}

.ticket-input-body select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.ticket-input-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<template>
  <div
    :class="['ticket-input-overlay', { fullscreen: isFullscreen }]"
    @click="close"
  >
    <div
      :class="['ticket-input-content', { fullscreen: isFullscreen }]"
      @click.stop
    >
      <div class="ticket-number" @click="copyTicketLink">
        <span v-if="!showCopyIcon">{{ localTicket.ticketNumber }}</span>
        <span v-else class="copy-icon">📋</span>
      </div>
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
          <div class="quill-editor-container">
            <div ref="quillToolbar"></div>
            <div ref="quillEditorContainer"></div>
          </div>

          <label for="ticketStatus" class="ticket-status">Status</label>
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
      showCopyIcon: false, // New data property
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
    copyTicketLink() {
      const ticketLink = `http://localhost:8080/board/${this.localTicket.board}?ticketNumber=${this.localTicket.ticketNumber}&fullscreen=true`;
      navigator.clipboard
        .writeText(ticketLink)
        .then(() => {
          this.showCopyIcon = true;
          setTimeout(() => {
            this.showCopyIcon = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy ticket link: ", err);
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
<!-- TicketView.vue -->
<style scoped>
.ticket-input-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
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
  background: #495057;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  max-width: 100%;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.ticket-input-content.fullscreen {
  width: 100%;
  height: 100%;
  border-radius: 0;
  box-shadow: none;
  padding: 20px;
  background: #343a40;
}

.close-btn {
  position: absolute;
  top: 4px;
  right: 10px;
  background: none;
  border: none;
  font-size: 2.5rem;
  cursor: pointer;
  color: #adb5bd;
}

.close-btn:hover,
h2,
label {
  color: #ffffff;
}

.ticket-input-body {
  margin-bottom: 20px;
}

.quill-editor-container {
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.quill-editor-container .ql-toolbar,
.quill-editor-container .ql-container {
  border-color: #ccc;
}

.ticket-input-body .ql-container {
  height: 200px;
  overflow-y: auto;
}
.ticket-input-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ticket-status {
  padding-top: 8px;
}
.ticket-number {
  position: absolute;
  top: 18px;
  right: 50px; /* Adjust the spacing to place it left of the close button */
  cursor: pointer;
  color: #4c94ff; /* Bootstrap primary color for links */
  text-decoration: underline;
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center; /* Center the text/icon */
}

.ticket-number:hover {
  color: #0056b3; /* Darker shade for hover effect */
}

.copy-icon {
  font-size: 1.5rem;
  color: green;
  display: inline-block;
}
</style>

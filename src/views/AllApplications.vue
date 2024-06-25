<template>
  <!-- -------- Header -------- -->
  <header>
    <div class="header-nav-left">
      <div class="header-nav-left-title">
        <h2>Список заяв за</h2>
        <select v-model="selectedRange" @change="handleRangeChange">
          <option value="all">весь час</option>
          <option value="week">тиждень</option>
          <option value="month">місяць</option>
          <option value="3_months">3 місяці</option>
          <option value="year">рік</option>
          <option value="custom">певний діапазон</option>
        </select>
      </div>
      <!-- Date input for custom range -->
      <div v-if="selectedRange === 'custom'" class="header-nav-left-date">
        <label for="startDate">Початкова дата:</label>
        <input type="date" id="startDate" v-model="customStartDate" />
      </div>
      <div v-if="selectedRange === 'custom'" class="header-nav-left-date">
        <label for="endDate">Кінцева дата:</label>
        <input type="date" id="endDate" v-model="customEndDate" />
      </div>
    </div>
    <div class="header-nav-right">
      <router-link class="header-nav-right-button" :to="{ name: 'CreateApplication' }">Створити заяву</router-link>
      <router-link class="header-nav-right-button" :to="{ name: 'CreateClient' }">Створити замовника</router-link>
    </div>
  </header>
  <!-- -------- Main -------- -->
  <main>
    <div class="search">
      <input class="search-input" type="text" v-model="searchQuery" placeholder="Пошук" />
      <button @click="handleSearchClear" class="clear-button">
        <img src="https://cdn-icons-png.flaticon.com/512/9428/9428870.png" alt="cross" />
      </button>
    </div>
    <p>Кількість заяв: {{ applications.length }}.</p>
    <div v-for="application in applications" :key="application.id" class="main-item">
      <router-link :to="{
        name: 'SingleApplicationDetails',
        params: { id: application.id },
      }" class="main-item-router">
        <div class="main-item-left">
          <span><b>Дата створення:</b> {{ formatDate(application.creationDate) }}</span>
          <span><b>Номер заяви:</b> {{ application.number }}</span>
          <span><b>Причина звернення:</b> {{ application.cause }}</span>
          <span><b>Потужність приєднання:</b> {{ application.powerCapacity }}</span>
          <span><b>Замовник:</b> {{ getClientFullName(application.clientId) }}</span>
        </div>
      </router-link>
      <button @click="handleAppDelete(application.id)" @focusout="handleAppFocusOut" class="delete-button">
        <span>Видалити</span>
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828945.png" alt="delete" />
      </button>
    </div>
  </main>
  <!-- -------- Popup -------- -->
  <SuccessPopup :isOpen="showPopup" @close="closeModal" successMessage="Заява була видалена." />
</template>

<script>
import applications from "../data/applications.json";
import clients from "../data/clients.json";
import SuccessPopup from "../components/SuccessPopup.vue";
import axios from "axios";

applications.sort((a, b) => {
  const dateA = new Date(a.creationDate);
  const dateB = new Date(b.creationDate);
  if (dateA > dateB) return -1;
  if (dateA < dateB) return 1;
  return 0;
});

export default {
  components: {
    SuccessPopup,
  },
  data() {
    return {
      applications: applications,
      clients: clients,
      selectedRange: "all",
      customStartDate: null,
      customEndDate: null,
      searchQuery: null,

      deleteButtonClickedNum: 0,
      clickedId: null,

      showPopup: false,
    };
  },
  mounted() {
    const storedSelectedRange = localStorage.getItem("selectedRange");
    this.selectedRange = storedSelectedRange ? storedSelectedRange : "all";
    this.handleRangeChange();
    const storedCustomStartDate = localStorage.getItem("customStartDate");
    this.customStartDate = storedCustomStartDate ? storedCustomStartDate : null;
    const storedCustomEndDate = localStorage.getItem("customEndDate");
    this.customEndDate = storedCustomEndDate ? storedCustomEndDate : null;
    // Popup
    const storedShowPopup = localStorage.getItem("showPopup");
    if (storedShowPopup === "1") {
      localStorage.setItem("showPopup", "0");
      // Show success popup
      this.openModal();
      this.wait(1500).then(() => {
        this.closeModal();
      });
    }
  },
  watch: {
    selectedRange(newValue) {
      localStorage.setItem("selectedRange", newValue);
    },
    customStartDate(newStartDate, oldStartDate) {
      localStorage.setItem("customStartDate", newStartDate);
      if (newStartDate !== oldStartDate && this.selectedRange === "custom") {
        this.applications = this.filterApplicationsByDateRange();
      }
    },
    customEndDate(newEndDate, oldEndDate) {
      localStorage.setItem("customEndDate", newEndDate);
      if (newEndDate !== oldEndDate && this.selectedRange === "custom") {
        this.applications = this.filterApplicationsByDateRange();
      }
    },
    searchQuery(newSearchQuery) {
      this.applications = applications.filter(app => {
        const client = this.clients.find(client => client.id === app.clientId);
        const query = newSearchQuery.toLowerCase();
        return (
          app.number.includes(this.searchQuery) ||
          app.cause.toLowerCase().includes(query) ||
          app.comment.toLowerCase().includes(query) ||
          app.powerCapacity.toLowerCase().includes(query) ||
          (client && (
            client.firstName.toLowerCase().includes(query) ||
            client.lastName.toLowerCase().includes(query) ||
            client.address.toLowerCase().includes(query) ||
            client.phoneNumber.toLowerCase().includes(query)
          ))
        );
      });
    },
  },
  methods: {
    // ------ Deleting and updating data ------
    async saveData(route, data, file = null) {
      try {
        const formData = { data: data, file: file };
        const response = await axios.post(route, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    },
    async deleteAppDocument(route) {
      try {
        const response = await axios.post(route);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    },
    handleAppFocusOut() {
      this.deleteButtonClickedNum = 0;
      this.clickedId = null;
    },
    handleAppDelete(id) {
      this.deleteButtonClickedNum++;
      if (this.deleteButtonClickedNum === 2) {
        if (this.clickedId === id) {
          this.deleteButtonClickedNum = 0;
          applications = applications.filter(application => application.id !== id);
          this.saveData("/upload-applications", applications);
          this.deleteAppDocument(`/documents/${id}/delete`);
          localStorage.setItem("showPopup", "1");
        } else {
          this.deleteButtonClickedNum = 1;
        }
      }
      this.clickedId = id;
    },
    // ------ Formating data ------
    formatDate(dateString) {
      return new Date(dateString)
        .toLocaleString()
        .split(",")[0]
        .replaceAll("/", ".");
    },
    getClientFullName(clientId) {
      const client = this.clients.find((client) => client.id === clientId);
      return client ? `${client.firstName} ${client.lastName}` : "Unknown";
    },
    // ------ Filtering applications ------
    filterRecentApplications(days = 0, months = 0, years = 0) {
      // Include only applications created within a specified timeframe from today's date.
      const today = new Date();
      const pastDate = new Date(
        today.getFullYear() - years,
        today.getMonth() - months,
        today.getDate() - days
      );

      return applications.filter(
        (application) => new Date(application.creationDate) >= pastDate
      );
    },
    filterApplicationsByDateRange() {
      if (!this.customStartDate || !this.customEndDate) { return applications; }
      const startDate = new Date(this.customStartDate);
      const endDate = new Date(this.customEndDate);
      return applications.filter((application) => {
        const appDate = new Date(application.creationDate);
        return appDate >= startDate && appDate <= endDate;
      });
    },
    filteredApplications() {
      this.customStartDate = null;
      this.customEndDate = null;
      switch (this.selectedRange) {
        case "all":
          return applications;
        case "week":
          return this.filterRecentApplications(7);
        case "month":
          return this.filterRecentApplications(0, 1);
        case "3_months":
          return this.filterRecentApplications(0, 3);
        case "year":
          return this.filterRecentApplications(0, 0, 1);
        case "custom":
          return this.filterApplicationsByDateRange();
        default:
          return applications;
      }
    },
    handleRangeChange() {
      this.applications = this.filteredApplications();
    },
    // ------ Searching ------
    handleSearchClear() {
      this.searchQuery = "";
    },
    // ------ Popup ------
    wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); },
    openModal() { this.showPopup = true; },
    closeModal() { this.showPopup = false; },
  },
};
</script>

<style scoped>
/* -------- Header -------- */
header {
  display: flex;
  justify-content: space-between;
  align-items: self-start;
  gap: 15px;
  flex-wrap: wrap;
  width: 90vw;
  margin: 30px auto 20px auto;
}

.header-nav-left {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: self-start;
}

.header-nav-left-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-nav-left-title h2 {
  margin: 0;
}

.header-nav-left-title select {
  color: #2c3e50;
  font-size: 18px;
  font-weight: bold;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 5px 40px 5px 7px;
}

.header-nav-left-title select:hover {
  cursor: pointer;
}

.header-nav-left-date {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-nav-left-date input {
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 3px;
}

.header-nav-left-date input:focus {
  box-shadow: none;
}

.header-nav-right {
  display: flex;
  justify-content: start;
  gap: 10px;
  flex-wrap: wrap;
}

.header-nav-right-button {
  background-color: #fbfbfb;
  border: 1px solid #ddd;
  border-radius: 10px;
  color: #333;
  text-decoration: none;
  text-align: center;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.header-nav-right-button:hover {
  color: #007bff;
}

/* -------- Main -------- */
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* -------- Main - Search bar -------- */
.search {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.search-input {
  width: 92%;
  font-size: 18px;
  font-weight: bold;
  background-color: white;
  border-top: 1px solid #ddd;
  border-right: none;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
  border-radius: 5px 0 0 5px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: none;
  --shadow-color: hsl(219, 100%, 94%);
  filter: drop-shadow(1px 2px 4px var(--shadow-color));
}

.clear-button {
  width: 8%;
  margin-left: -1%;
  background-color: white;
  border-top: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  border-radius: 0 5px 5px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: rgb(243, 243, 243);
}

.clear-button img {
  width: 30px;
}

/* -------- Main - Body -------- */
main p {
  font-size: 16px;
}

.main-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  color: black;
  transition: all 0.2s ease;
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset;
}

.main-item:hover {
  background-color: #f7f7f7;
  cursor: pointer;
}

.main-item-router {
  width: 100%;
  padding: 20px;
  display: block;
}

.main-item-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* -------- Delete button -------- */
.delete-button {
  position: absolute;
  right: 20px;
  z-index: 1;
  width: 50px;
  height: 50px;
  border-radius: 50px;
  background-color: #fff;
  cursor: pointer;
  box-shadow: rgba(149, 157, 165, 0.827) 0px 2px 14px;
  overflow: hidden;
  transition: .2s;
  opacity: 0.75;
}

.delete-button:hover {
  background-color: #c6c6c6b3;
  transform: scale(1.05);
  box-shadow: 0 0 4px #c6c6c6b3;
  transition: .2s;
}

.delete-button:focus {
  width: 130px;
  height: 50px;
  transition: .2s;
}

.delete-button img {
  color: #e02a2a;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: .1s;
}

.delete-button:focus img {
  opacity: 0;
}

.delete-button span {
  width: fit-content;
  padding: 0 5px;
  position: absolute;
  opacity: 0;
  transform: translate(-50%, -50%);
  font-weight: 600;
  transition: .2s;
}

.delete-button:focus span {
  opacity: 1;
  transition: .2s;
}

@media (max-width: 485px) {
  .main-item {
    flex-direction: column;
    padding-bottom: 40px;
  }

  .delete-button {
    bottom: 15px;
    right: auto;
    width: 40px;
    height: 40px;
  }

  .delete-button:focus {
    height: 40px;
  }
}
</style>

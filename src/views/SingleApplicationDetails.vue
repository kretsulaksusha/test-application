<template>
  <!-- -------- Header -------- -->
  <header>
    <router-link class="redirect-button" :to="{ name: 'Applications' }">
      <img src="https://cdn-icons-png.flaticon.com/512/4672/4672806.png" alt="left arrow" />
      Всі заяви
    </router-link>
    <div class="header-right">
      <button v-if="!edit" class="header-button" @click="handlePrintClick">
        Друкувати
      </button>
      <button class="header-button" :class="{ 'disabled-header-button': edit }" :disabled="edit"
        @click="handleEditClick">
        Редагувати
      </button>
    </div>
  </header>
  <!-- -------- Main -------- -->
  <main v-if="application">
    <div id="printableArea">
      <h1>Заява №{{ application.number }}</h1>
      <!-- Main Application Data -->
      <p>
        <b>Номер заяви:</b>
        <span v-if="!edit">{{ number }}</span>
        <input v-if="edit" type="number" v-model="number" />
        <span v-if="invalidValues.includes('number')" class="error-message">
          Будь ласка, введіть коректний номер.
        </span>
        <span v-if="invalidValues.includes('numberExists')" class="error-message">
          Номер вже існує, будь ласка, введіть інший.
        </span>
      </p>
      <p>
        <b>Дата створення:</b>
        <span v-if="!edit">{{ formatDate(creationDate) }}</span>
        <input v-if="edit" type="date" v-model="creationDate" />
        <span v-if="invalidValues.includes('creationDate')" class="error-message">
          Будь ласка, введіть дату.
        </span>
      </p>
      <p>
        <b>Причина звернення:</b>
        <span v-if="!edit">{{ cause }}</span>
        <select v-if="edit" v-model="cause">
          <option value="нове підключення">нове підключення</option>
          <option value="збільшення існуючої потужності">
            збільшення існуючої потужності
          </option>
        </select>
        <span v-if="invalidValues.includes('cause')" class="error-message">
          Будь ласка, оберіть причину звернення.
        </span>
      </p>
      <p>
        <b>Коментар:</b>
        <span v-if="!edit">{{ comment }}</span>
        <input v-if="edit" type="text" v-model="comment" />
      </p>
      <p>
        <b>Потужність приєднання:</b>
        <span v-if="!edit">{{ powerCapacity }}</span>
        <input v-if="edit" type="number" v-model="powerCapacity" />
        <span v-if="invalidValues.includes('powerCapacity')" class="error-message">
          Будь ласка, введіть коректну потужність приєднання.
        </span>
      </p>
      <!-- Main Client Data -->
      <h2>Дані замовника</h2>
      <p>
        <b>Імʼя:</b>
        <span v-if="!edit">{{ firstName }}</span>
        <input v-if="edit" type="text" v-model="firstName" />
        <span v-if="invalidValues.includes('firstName')" class="error-message">
          Будь ласка, введіть коректне імʼя.
        </span>
      </p>
      <p>
        <b>Прізвище:</b>
        <span v-if="!edit">{{ lastName }}</span>
        <input v-if="edit" type="text" v-model="lastName" />
        <span v-if="invalidValues.includes('lastName')" class="error-message">
          Будь ласка, введіть коректне прізвище.
        </span>
      </p>
      <p>
        <b>Адреса:</b>
        <span v-if="!edit">{{ address }}</span>
        <input v-if="edit" type="text" v-model="address" />
        <span v-if="invalidValues.includes('address')" class="error-message">
          Будь ласка, введіть коректну адресу.
        </span>
      </p>
      <p>
        <b>Номер тел.:</b>
        <span v-if="!edit">{{ phoneNumber }}</span>
        <input v-if="edit" type="tel" v-model="phoneNumber" />
        <span v-if="invalidValues.includes('phoneNumber')" class="error-message">
          Будь ласка, введіть коректний номер телефону.
        </span>
      </p>
    </div>
    <!-- Main File View/Upload/Delete -->
    <h2>Документ</h2>
    <!-- Select new file -->
    <div v-if="edit" class="main-file-upload">
      <input id="file-upload" type="file" accept=".pdf, .doc, .docx" @change="onFileChange" ref="fileUpload" hidden />
      <label for="file-upload" class="main-file-upload-label">
        Виберіть новий файл (PDF, DOC, DOCX)
      </label>
      <span v-if="file">{{ file.name }}</span>
      <!-- Clear selection -->
      <button v-if="file" @click="handleClearSelectedFile" class="clear-button">
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828945.png" alt="delete icon" />
      </button>
    </div>
    <!-- Preview pdf file -->
    <iframe v-if="fileUrl.type === 'pdf'" title="PDF" :src="fileUrl.url" class="main-pdf-file-preview"></iframe>
    <!-- Download doc/docx file -->
    <div v-if="/docx?/.test(fileUrl.type)" class="main-file-download">
      <a :download="`document_${number}.${fileUrl.type}`" :href="`${fileUrl.url}`">
        Завантажити прикріплений документ {{ fileUrl.type === "doc" ? '(DOC)' : '(DOCX)' }}
      </a>
    </div>
    <!-- Delete attached file -->
    <div v-if="!file && fileUrl.url && edit" class="main-delete-container">
      <b>Видалити прикріплений документ:</b>
      <button @click="handleAttachedFileDelete(application.id)" @focusout="handleAttachedFileFocusOut"
        class="delete-button">
        <span>Видалити</span>
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828945.png" alt="delete icon" />
      </button>
    </div>
    <div v-if="!fileUrl.url && !edit">
      <p>Немає завантаженого документа.</p>
    </div>
  </main>
  <div v-else class="loading">
    <h2>Loading...</h2>
  </div>
  <!-- -------- Footer -------- -->
  <footer v-if="edit">
    <button class="cancel-button" @click="handleCancelClick">Відмінити</button>
    <button class="save-button" @click="handleSaveClick">Зберегти</button>
  </footer>
  <!-- -------- Popup -------- -->
  <SuccessPopup :isOpen="showPopup" @close="closeModal" successMessage="Заява була оновлена та збережена." />
</template>

<script>
import applications from "../data/applications.json";
import clients from "../data/clients.json";
import axios from "axios";
import SuccessPopup from "../components/SuccessPopup.vue";

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: {
    SuccessPopup,
  },
  data() {
    return {
      application: null,
      client: null,

      number: null,
      creationDate: null,
      cause: null,
      comment: null,
      powerCapacity: null,
      firstName: null,
      lastName: null,
      address: null,
      phoneNumber: null,
      invalidValues: [],

      file: "",
      fileUrl: {
        url: "",
        type: "",
      },

      edit: false,
      showPopup: false,
      deleteButtonClickedNum: 0,
    };
  },
  mounted() {
    this.loadDocument();
    const storedShowPopup = localStorage.getItem("showPopup");
    if (storedShowPopup === "1") {
      localStorage.setItem("showPopup", "0");
      // Success popup
      this.openModal();
      this.wait(1500).then(() => {
        this.closeModal();
      });
    }
  },
  computed: {
    isValidNumber() { return this.number > 0; },
    isUniqueNumber() {
      const filteredApps = applications.filter(
        (app) => (parseInt(app.number) === this.number) && (app.id !== this.id)
      );
      return filteredApps.length === 0;
    },
    isValidCreationDate() { return !!this.creationDate; },
    isValidCause() { return !!this.cause; },
    isValidPowerCapacity() { return this.powerCapacity > 0; },
    isValidAddress() { return !!this.address; },
    isValidPhoneNumber() { return /^\+?\d+$/.test(this.phoneNumber); },
  },
  created() {
    this.application = this.fetchById(applications, this.$route.params.id);
    this.client = this.fetchById(clients, this.application.clientId);
    this.getParams();
  },
  methods: {
    // ------ Loading initial data ------
    fetchById(data, id) { return data.find((value) => value.id === id); },
    getParams() {
      // Application data
      this.number = this.application.number;
      this.creationDate = this.application.creationDate;
      this.cause = this.application.cause;
      this.comment = this.application.comment;
      this.powerCapacity = this.application.powerCapacity;
      // Client data
      this.firstName = this.client.firstName;
      this.lastName = this.client.lastName;
      this.address = this.client.address;
      this.phoneNumber = this.client.phoneNumber;
    },
    // ------ Validating and sending data to the server ------
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
    changeFilenameToAppId() {
      var blob = this.file.slice(0, this.file.size, this.file.type);
      this.file = new File([blob], `${this.id}.${this.file.name.split(".").pop()}`,
        { type: this.file.type, }
      );
    },
    updateAndSaveApplications() {
      this.application.number = this.number;
      this.application.creationDate = this.creationDate;
      this.application.cause = this.cause;
      this.application.comment = this.comment;
      this.application.powerCapacity = this.powerCapacity;

      if (this.file) { this.changeFilenameToAppId(); }
      this.saveData("/upload-applications", applications, this.file);
    },
    updateAndSaveClients() {
      this.client.firstName = this.firstName;
      this.client.lastName = this.lastName;
      this.client.address = this.address;
      this.client.phoneNumber = this.phoneNumber;

      this.saveData("/upload-clients", clients);
    },
    changeIdIfUserExist() {
      for (let index = 0; index < clients.length; index++) {
        const client = clients[index];
        if (
          client.firstName === this.firstName &&
          client.lastName === this.lastName &&
          client.address === this.address &&
          client.phoneNumber === this.phoneNumber &&
          client.id !== this.client.id
        ) {
          this.application.clientId = client.id;
          return true;
        }
      }
      return false;
    },
    capitalizeAndTrim(input) {
      input = input.trim();
      return input.charAt(0).toUpperCase() + input.slice(1);
    },
    formatInputData() {
      this.firstName = this.capitalizeAndTrim(this.firstName);
      this.lastName = this.capitalizeAndTrim(this.lastName);
      this.phoneNumber = this.phoneNumber.replace("+", "");
    },
    isValidName(name) { return name && /^([^0-9\s]|[ '])+$/.test(name); },
    isValidUserInput() {
      this.invalidValues.splice(0, this.invalidValues.length);

      if (!this.isValidNumber) { this.invalidValues.push("number"); }
      else { if (!this.isUniqueNumber) { this.invalidValues.push("numberExists"); } }
      if (!this.isValidCreationDate) { this.invalidValues.push("creationDate"); }
      if (!this.isValidCause) { this.invalidValues.push("cause"); }
      if (!this.isValidPowerCapacity) { this.invalidValues.push("powerCapacity"); }
      if (!this.isValidName(this.firstName)) { this.invalidValues.push("firstName"); }
      if (!this.isValidName(this.lastName)) { this.invalidValues.push("lastName"); }
      if (!this.isValidAddress) { this.invalidValues.push("address"); }
      if (!this.isValidPhoneNumber) { this.invalidValues.push("phoneNumber"); }

      return this.invalidValues.length === 0;
    },
    handleSaveClick() {
      if (!this.isValidUserInput()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      this.edit = false;

      this.formatInputData();
      if (!this.changeIdIfUserExist()) {
        this.updateAndSaveClients();
      }

      this.updateAndSaveApplications();
      localStorage.setItem("showPopup", "1");
      window.location.reload();
    },
    // ------ Changing input file ------
    onFileChange(event) {
      const files = event.target.files;
      if (files.length > 0) {
        this.file = files[0];
        this.fileUrl = {
          url: "",
          type: "",
        };
        if (this.file.type === "application/pdf") {
          this.fileUrl = {
            url: URL.createObjectURL(this.file),
            type: "pdf",
          };
        }
      }
    },
    async loadDocument() {
      try {
        const response = await axios.get(`/documents/${this.id}`, {
          responseType: 'blob',
        });
        const fileType = response.data.type;
        if (fileType === "application/json") { return; }
        const blob = new Blob([response.data], { type: response.data.type });
        this.fileUrl = {
          url: URL.createObjectURL(blob),
          type: fileType === 'application/pdf'
            ? 'pdf'
            : fileType === 'application/msword'
              ? 'doc'
              : 'docx',
        };
      } catch (error) {
        console.error('Error loading document:', error);
      }
    },
    // ------ Deleting file ------
    handleClearSelectedFile() {
      this.$refs.fileUpload.value = null;
      this.file = "";
      this.fileUrl = {
        url: "",
        type: "",
      };
      this.loadDocument();
    },
    async deleteAppDocument(route) {
      try {
        const response = await axios.post(route);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    },
    handleAttachedFileFocusOut() {
      this.deleteButtonClickedNum = 0;
    },
    handleAttachedFileDelete(id) {
      this.deleteButtonClickedNum++;
      if (this.deleteButtonClickedNum === 2) {
        this.deleteButtonClickedNum = 0;
        this.deleteAppDocument(`/documents/${id}/delete`);
        this.fileUrl = {
          url: "",
          type: "",
        };
        localStorage.setItem("showPopup", "1");
        window.location.reload();
      }
    },
    // ------ Generate and print document ------
    handlePrintClick() {
      const printContent = document.getElementById('printableArea').innerHTML;
      const newWindow = window.open('', '', 'width=750,height=450');
      newWindow.document.write(`
        <html>
          <head>
            <title>Друк заяви</title>
            <style>
              @page { size: auto;  margin: 0mm; }
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                line-height: 1.6;
                word-break: break-all;
                font-size: 14px;
              }
              h1, h2 {
                text-align: center;
              }
              b {
                margin-right: 5px;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.print();
      newWindow.close();
    },
    handleCancelClick() {
      this.getParams();
      this.file = "";
      this.fileUrl = {
        url: "",
        type: "",
      };
      this.loadDocument();
      this.edit = false;
    },
    // ------ Popup ------
    wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); },
    openModal() { this.showPopup = true; },
    closeModal() { this.showPopup = false; },
    // ------ Styling date ------
    formatDate(dateString) {
      return new Date(dateString)
        .toLocaleString()
        .split(",")[0]
        .replaceAll("/", ".");
    },
    // ------ Handling button click ------
    handleEditClick() { this.edit = true; },
  },
};
</script>

<style scoped>
/* -------- Components -------- */
.redirect-button,
.header-button,
.cancel-button,
.save-button {
  display: flex;
  gap: 10px;
  align-items: center;
  background-color: #fbfbfb;
  border: 1px solid #ddd;
  border-radius: 10px;
  color: #333;
  text-decoration: none;
  text-align: center;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.error-message {
  color: #e02a2a;
  font-size: 13px;
  display: block;
  margin-top: 3px;
}

/* -------- Header -------- */
header,
footer {
  width: 90vw;
  margin: 30px auto;
  display: flex;
  justify-content: space-between;
  align-content: center;
}

.header-right {
  display: flex;
  gap: 15px;
}

.redirect-button:hover {
  color: #007bff;
  cursor: pointer;
}

.redirect-button img {
  height: 20px;
  opacity: 70%;
}

.disabled-header-button {
  background-color: #333;
  color: #fbfbfb;
}

/* -------- Main -------- */
main {
  width: 90vw;
  margin: 30px auto;
  word-break: break-all;
}

#printableArea h1,
h2 {
  text-align: center;
}

#printableArea p {
  margin: 15px 0;
}

#printableArea p b {
  margin-right: 7px;
}

#printableArea p input {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 6px 10px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 15px;
  width: 250px;
}

#printableArea p input:focus {
  border: 1px dotted #494949;
  box-shadow: none;
}

#printableArea p select {
  color: #2c3e50;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

#printableArea p select:hover {
  cursor: pointer;
}

#printableArea p select:focus {
  border: 1px dotted #494949;
  outline: none;
}

.loading {
  text-align: center;
}

/* -------- Main - File Upload -------- */
.main-file-upload {
  width: 100%;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
}

.main-file-upload span {
  width: fit-content;
}

.main-file-upload-label {
  width: max-content;
  padding: 10px 20px;
  display: block;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.main-file-upload-label:hover {
  background-color: #ddd;
  color: #1c2733;
  cursor: pointer;
}

.main-pdf-file-preview {
  margin-bottom: 25px;
  width: 100%;
  height: 600px;
}

.main-file-download a {
  width: fit-content;
  padding: 10px 20px;
  margin-bottom: 20px;
  display: block;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.main-file-download a:hover {
  background-color: #ddd;
  color: #1c2733;
  cursor: pointer;
}

/* -------- Main - Delete container -------- */
.main-delete-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 10px;
}

/* Main - Delete container - Delete button */
.delete-button {
  position: relative;
  z-index: 1;
  width: 45px;
  height: 45px;
  border-radius: 50px;
  background-color: #fff;
  cursor: pointer;
  box-shadow: 0 0 8px #333333b3;
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
  width: 150px;
  height: 45px;
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
  opacity: 0;
  transform: translate(-50%, -50%);
  font-weight: 600;
  transition: .2s;
}

.delete-button:focus span {
  opacity: 1;
  transition: .2s;
}

/* Main - Clear button */
.clear-button {
  position: relative;
  z-index: 1;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #fff;
  cursor: pointer;
  box-shadow: 0 0 8px #333333b3;
  overflow: hidden;
  transition: .2s;
}

.clear-button:hover {
  background-color: #c6c6c6b3;
  transform: scale(1.05);
  box-shadow: 0 0 4px #c6c6c6b3;
  transition: .2s;
}

/* -------- Footer -------- */
footer {
  margin-bottom: 60px;
  display: flex;
  justify-content: space-between;
  align-content: center;
}

.cancel-button:hover {
  background-color: #e02a2a;
  color: #ffffff;
}

.save-button:hover {
  background-color: #48a14d;
  color: #ffffff;
}
</style>

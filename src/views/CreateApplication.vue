<template>
  <!-- -------- Header -------- -->
  <header>
    <router-link class="redirect-button" :to="{ name: 'Applications' }">
      <img src="https://cdn-icons-png.flaticon.com/512/4672/4672806.png" alt="left arrow" />
      Всі заяви
    </router-link>
  </header>
  <!-- -------- Main -------- -->
  <main>
    <h1>Створити заяву</h1>
    <!-- Main Application Data -->
    <p>
      <b>Номер заяви:</b>
      <input type="number" min="0" v-model="number" />
      <span v-if="invalidValues.includes('number')" class="error-message">
        Будь ласка, введіть коректний номер.
      </span>
      <span v-if="invalidValues.includes('numberExists')" class="error-message">
        Номер вже існує, будь ласка, введіть інший.
      </span>
    </p>
    <p>
      <b>Дата створення:</b>
      <input type="date" v-model="creationDate" />
      <span v-if="invalidValues.includes('creationDate')" class="error-message">
        Будь ласка, введіть дату.
      </span>
    </p>
    <p>
      <b>Причина звернення:</b>
      <select v-model="cause">
        <option value="" selected disabled>Оберіть причину</option>
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
      <input type="text" v-model="comment" />
    </p>
    <p>
      <b>Потужність приєднання:</b>
      <input type="number" min="0" v-model="powerCapacity" />
      <span v-if="invalidValues.includes('powerCapacity')" class="error-message">
        Будь ласка, введіть коректну потужність приєднання.
      </span>
    </p>
    <!-- Main Client Data -->
    <h2>Дані замовника</h2>
    <div class="tabs">
      <a @click="handleChangeTab('create')" :class="[activeTab === 'create' ? 'active' : '']">Створити</a>
      <a @click="handleChangeTab('select')" :class="[activeTab === 'select' ? 'active' : '']">Обрати</a>
    </div>
    <div v-if="activeTab === 'create'" class="tabcontent">
      <p>
        <b>Імʼя:</b>
        <input type="text" v-model="client.firstName" />
        <span v-if="invalidValues.includes('firstName')" class="error-message">
          Будь ласка, введіть коректне імʼя.
        </span>
      </p>
      <p>
        <b>Прізвище:</b>
        <input type="text" v-model="client.lastName" />
        <span v-if="invalidValues.includes('lastName')" class="error-message">
          Будь ласка, введіть коректне прізвище.
        </span>
      </p>
      <p>
        <b>Адреса:</b>
        <input type="text" v-model="client.address" />
        <span v-if="invalidValues.includes('address')" class="error-message">
          Будь ласка, введіть коректну адресу.
        </span>
      </p>
      <p>
        <b>Номер тел.:</b>
        <input type="tel" v-model="client.phoneNumber" placeholder="380123456789" />
        <span v-if="invalidValues.includes('phoneNumber')" class="error-message">
          Будь ласка, введіть коректний номер телефону.
        </span>
      </p>
      <span v-if="userExistsError" class="error-message user-exists-error">Замовник вже існує.</span>
    </div>
    <div v-if="activeTab === 'select'" class="tabcontent">
      <Combobox v-model="client" class="tabcontent-input">
        <div class="relative w-full">
          <div
            class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <ComboboxInput
              class="w-full border-none py-2 pl-3 pr-10 text-md leading-5 text-gray-900 focus:ring-0 font-bold"
              :displayValue="displayClientInputValue" @change="handleInputChange" @click="handleInputClick"
              @blur="handleInputBlur" />
            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>
          <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0"
            @after-leave="query = ''">
            <ComboboxOptions
              class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              <div v-if="filteredClients.length === 0 && query !== ''"
                class="relative cursor-default select-none px-4 py-2 text-gray-700">
                Нічого не знайдено.
              </div>
              <ComboboxOption v-for="client in filteredClients" as="template" :key="client.id" :value="client"
                v-slot="{ selected, active }">
                <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                  'bg-gray-600 text-white': active,
                  'text-gray-900': !active,
                }">
                  <span class="block truncate" :class="{
                    'font-medium': selected,
                    'font-normal': !selected,
                  }">{{ displayClientOptionValue(client) }}</span>
                  <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3" :class="{
                    'text-white': active,
                    'text-teal-600': !active,
                  }">
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
      </Combobox>
      <span v-if="client.id !== 'default_option'">
        <p><b>Імʼя:</b><span>{{ client.firstName }}</span></p>
        <p><b>Прізвище:</b><span>{{ client.lastName }}</span></p>
        <p><b>Адреса:</b><span>{{ client.address }}</span></p>
        <p><b>Номер тел.:</b><span>{{ client.phoneNumber }}</span></p>
      </span>
    </div>
    <!-- Main File Upload -->
    <h2>Завантажити документ</h2>
    <!-- <div class="main-file-upload">
      <input id="file-upload" type="file" accept=".pdf, .doc, .docx" @change="onFileChange" hidden />
      <label for="file-upload" class="main-file-upload-label">Виберіть файл (PDF, DOC, DOCX)</label>
      <span v-if="file">{{ file.name }}</span>
    </div> -->
    <div class="main-file-upload">
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
    <iframe v-if="pdfUrl" :src="pdfUrl" class="main-file-preview"></iframe>
  </main>
  <!-- -------- Footer -------- -->
  <footer>
    <button class="save-button" @click="handleSaveClick">
      Зберегти
    </button>
  </footer>
  <!-- -------- Popup -------- -->
  <SuccessPopup :isOpen="showPopup" @close="closeModal" successMessage="Заява була створена та збережена." />
</template>

<script>
import applications from "../data/applications.json";
import clients from "../data/clients.json";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import SuccessPopup from "../components/SuccessPopup.vue";

clients.sort((a, b) => {
  const fullNameA = (a.firstName + a.lastName).toLowerCase();
  const fullNameB = (b.firstName + b.lastName).toLowerCase();
  if (fullNameA < fullNameB) return -1;
  if (fullNameA > fullNameB) return 1;
  return 0;
});

export default {
  components: {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
    CheckIcon,
    ChevronUpDownIcon,
    SuccessPopup,
  },
  data() {
    return {
      number: null,
      creationDate: null,
      cause: null,
      comment: "",
      powerCapacity: null,
      client: {
        id: "default_option",
        firstName: "",
        lastName: "",
        address: "",
        phoneNumber: "",
      },
      invalidValues: [],

      clients: clients,
      activeTab: "create",
      query: "",
      userExistsError: false,

      file: "",
      pdfUrl: "",

      showPopup: false,
    };
  },
  mounted() {
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
  computed: {
    filteredClients() {
      return this.query === ""
        ? this.clients
        : this.clients.filter((client) =>
          (client.firstName + client.lastName)
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(this.query.toLowerCase().replace(/\s+/g, ""))
        );
    },
    isValidNumber() { return this.number > 0; },
    isUniqueNumber() {
      const filteredApps = applications.filter((app) => parseInt(app.number) === this.number);
      return filteredApps.length === 0;
    },
    isValidCreationDate() { return !!this.creationDate; },
    isValidCause() { return !!this.cause; },
    isValidPowerCapacity() { return this.powerCapacity > 0; },
    isValidAddress() { return !!this.client.address; },
    isValidPhoneNumber() { return /^\+?\d+$/.test(this.client.phoneNumber); },
  },
  methods: {
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
    changeFilenameToAppId(id) {
      var blob = this.file.slice(0, this.file.size, this.file.type);
      this.file = new File([blob], `${id}.${this.file.name.split(".").pop()}`,
        { type: this.file.type, }
      );
    },
    createAndSaveApplication() {
      const uniqueId = uuidv4();
      applications.push({
        id: uniqueId,
        number: this.number,
        creationDate: this.creationDate,
        cause: this.cause,
        comment: this.comment,
        powerCapacity: this.powerCapacity,
        clientId: this.client.id,
      });
      if (this.file) { this.changeFilenameToAppId(uniqueId); }
      this.saveData("/upload-applications", applications, this.file);
    },
    userExists() {
      for (let index = 0; index < clients.length; index++) {
        const client = clients[index];
        if (
          client.firstName === this.client.firstName &&
          client.lastName === this.client.lastName &&
          client.address === this.client.address &&
          client.phoneNumber === this.client.phoneNumber
        ) {
          this.userExistsError = true;
          return true;
        }
      }
      this.userExistsError = false;
      return false;
    },
    capitalizeAndTrim(input) {
      input = input.trim();
      return input.charAt(0).toUpperCase() + input.slice(1);
    },
    formatClientData() {
      this.client.firstName = this.capitalizeAndTrim(this.client.firstName.toLowerCase());
      this.client.lastName = this.capitalizeAndTrim(this.client.lastName.toLowerCase());
      this.client.phoneNumber = this.client.phoneNumber.replace("+", "");
    },
    createAndSaveClient() {
      this.formatClientData();
      if (this.userExists()) { return ""; }

      const uniqueId = uuidv4();
      clients.push({
        id: uniqueId,
        firstName: this.client.firstName,
        lastName: this.client.lastName,
        address: this.client.address,
        phoneNumber: this.client.phoneNumber,
      });

      this.saveData("/upload-clients", clients);
      return uniqueId;
    },
    isValidName(name) { return name && /^([^0-9\s]|[ '])+$/.test(name); },
    isValidUserInput() {
      this.invalidValues.splice(0, this.invalidValues.length);

      if (!this.isValidNumber) { this.invalidValues.push("number"); }
      else { if (!this.isUniqueNumber) { this.invalidValues.push("numberExists"); } }
      if (!this.isValidCreationDate) { this.invalidValues.push("creationDate"); }
      if (!this.isValidCause) { this.invalidValues.push("cause"); }
      if (!this.isValidPowerCapacity) { this.invalidValues.push("powerCapacity"); }
      if (!this.isValidName(this.client.firstName)) { this.invalidValues.push("firstName"); }
      if (!this.isValidName(this.client.lastName)) { this.invalidValues.push("lastName"); }
      if (!this.isValidAddress) { this.invalidValues.push("address"); }
      if (!this.isValidPhoneNumber) { this.invalidValues.push("phoneNumber"); }

      return this.invalidValues.length === 0;
    },
    handleSaveClick() {
      if (!this.isValidUserInput()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (this.client.id === "default_option") {
        const res = this.createAndSaveClient();
        if (res) { this.client.id = res; }
        else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      this.createAndSaveApplication();
      localStorage.setItem("showPopup", "1");
    },
    // ------ Changing tabs for creating and selecting a client ------
    handleChangeTab(tab) {
      this.activeTab = tab;
      this.client = {
        id: "default_option",
        firstName: tab === "create" ? "" : "Оберіть",
        lastName: tab === "create" ? "" : "замовника",
        address: "",
        phoneNumber: "",
      };
      this.query = "";
    },
    // ------ Changing input values for selecting a client ------
    displayClientInputValue(client) {
      return client.firstName + (client.lastName ? ' ' : '') + client.lastName;
    },
    displayClientOptionValue(client) {
      return `${client.firstName} ${client.lastName} (тел. ${client.phoneNumber})`;
    },
    handleInputChange(event) { this.query = event.target.value; },
    handleInputBlur() {
      if (this.client.id === 'default_option') {
        this.client.firstName = 'Оберіть';
        this.client.lastName = 'замовника';
      }
    },
    handleInputClick() {
      if (this.client.id === 'default_option') {
        this.client.firstName = '';
        this.client.lastName = '';
      }
    },
    // ------ Changing input file ------
    onFileChange(event) {
      const files = event.target.files;
      if (files.length > 0) {
        this.pdfUrl = "";
        this.file = files[0];
        if (this.file.type === "application/pdf") {
          this.pdfUrl = URL.createObjectURL(this.file);
        }
      }
    },
    // ------ Clearing selected file ------
    handleClearSelectedFile() {
      this.$refs.fileUpload.value = null;
      this.file = "";
      this.pdfUrl = "";
    },
    // ------ Popup ------
    wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); },
    openModal() { this.showPopup = true; },
    closeModal() { this.showPopup = false; },
  },
};
</script>

<style scoped>
/* -------- Components -------- */
.redirect-button,
.save-button {
  display: flex;
  gap: 10px;
  align-items: center;
  background-color: #fbfbfb;
  border: 1px solid #ddd;
  border-radius: 10px;
  color: #333;
  text-decoration: none;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.error-message {
  color: #e02a2a;
  font-size: 13px;
  display: block;
  margin-top: 3px;
}

.user-exists-error {
  font-weight: bold;
  font-size: 15px;
}

/* -------- Header -------- */
header {
  display: flex;
  justify-content: space-between;
  align-content: center;
}

.redirect-button:hover {
  color: #007bff;
  cursor: pointer;
}

.redirect-button img {
  height: 20px;
  opacity: 70%;
}

/* -------- Main -------- */
main {
  width: 90vw;
  margin: 30px auto;
}

main h1,
h2 {
  text-align: center;
}

main p {
  margin: 15px 0;
}

main p b {
  margin-right: 7px;
}

main p input {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 6px 10px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 15px;
  width: 250px;
}

main p input:focus {
  outline: none;
  border: 1px dotted #494949;
  box-shadow: none;
}

main p select {
  color: #2c3e50;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

main p select:hover {
  cursor: pointer;
}

main p select:focus {
  border: 1px dotted #494949;
  outline: none;
}

/* -------- Main - User Data (tabs) -------- */
.tabs {
  display: flex;
  gap: 10px;
  margin-left: 10px;
  overflow: hidden;
  margin-bottom: -1px;
}

.tabs a {
  float: left;
  cursor: pointer;
  padding: 12px 24px;
  transition: background-color 0.2s;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
  border-radius: 10px 10px 0 0;
  font-size: 15px;
  font-weight: bold;
}

.tabs a:hover {
  background-color: #aaa;
  color: #fff;
}

.tabs a.active {
  background-color: #fff;
  color: #484848;
  border-bottom: 2px solid #fff;
  cursor: default;
}

.tabcontent {
  padding: 15px 10px 0 10px;
  border-top: 1px solid #ccc;
}

.tabcontent-input {
  width: 45%;
  min-width: 300px;
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

.main-file-preview {
  margin-bottom: 25px;
  width: 100%;
  height: 600px;
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
  justify-content: center;
  align-content: center;
}

.save-button:hover {
  background-color: #48a14d;
  color: #ffffff;
}
</style>

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
    <h1>Створити замовника</h1>
    <p>
      <b>Імʼя:</b>
      <input type="text" v-model="firstName" />
      <span v-if="invalidValues.includes('firstName')" class="error-message">
        Будь ласка, введіть коректне імʼя.
      </span>
    </p>
    <p>
      <b>Прізвище:</b>
      <input type="text" v-model="lastName" />
      <span v-if="invalidValues.includes('lastName')" class="error-message">
        Будь ласка, введіть коректне прізвище.
      </span>
    </p>
    <p>
      <b>Адреса:</b>
      <input type="text" v-model="address" />
      <span v-if="invalidValues.includes('address')" class="error-message">
        Будь ласка, введіть коректну адресу.
      </span>
    </p>
    <p>
      <b>Номер тел.:</b>
      <input type="tel" v-model="phoneNumber" placeholder="380123456789" />
      <span v-if="invalidValues.includes('phoneNumber')" class="error-message">
        Будь ласка, введіть коректний номер телефону.
      </span>
    </p>
    <span v-if="userExistsError" class="error-message user-exists-error">
      Замовник вже існує.
    </span>
  </main>
  <!-- -------- Footer -------- -->
  <footer>
    <button class="single-app-nav-button save-button" @click="handleSaveClick">
      Зберегти
    </button>
  </footer>
  <!-- -------- Popup -------- -->
  <SuccessPopup :isOpen="showPopup" @close="closeModal" successMessage="Новий замовник був збережений." />
</template>

<script setup>
import clients from "../data/clients.json";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import SuccessPopup from "../components/SuccessPopup.vue";
</script>

<script>
export default {
  components: {
    SuccessPopup,
  },
  data() {
    return {
      clients: clients,

      firstName: null,
      lastName: null,
      address: null,
      phoneNumber: null,

      invalidValues: [],
      userExistsError: false,

      showPopup: false,
    };
  },
  mounted() {
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
    isValidFirstName() {
      return this.firstName && /^([^0-9\s]|[ '])+$/.test(this.firstName);
    },
    isValidLastName() {
      return this.lastName && /^([^0-9\s]|[ '])+$/.test(this.lastName);
    },
    isValidAddress() {
      return !!this.address;
    },
    isValidPhoneNumber() {
      return /^\+?\d+$/.test(this.phoneNumber);
    },
  },
  methods: {
    async saveData(route, data) {
      try {
        const response = await axios.post(
          route, { data: data, }, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    },
    createAndSaveClient() {
      const uniqueId = uuidv4();
      clients.push({
        id: uniqueId,
        firstName: this.firstName,
        lastName: this.lastName,
        address: this.address,
        phoneNumber: this.phoneNumber,
      });
      this.saveData("/upload-clients", clients);
    },
    userExists() {
      for (let index = 0; index < clients.length; index++) {
        const client = clients[index];
        if (
          client.firstName === this.firstName &&
          client.lastName === this.lastName &&
          client.address === this.address &&
          client.phoneNumber === this.phoneNumber
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
    formatInputData() {
      this.firstName = this.capitalizeAndTrim(this.firstName.toLowerCase());
      this.lastName = this.capitalizeAndTrim(this.lastName.toLowerCase());
      this.phoneNumber = this.phoneNumber.replace("+", "");
    },
    isValidName(name) { return name && /^([^0-9\s]|[ '])+$/.test(name); },
    isValidUserInput() {
      this.invalidValues.splice(0, this.invalidValues.length);

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

      this.formatInputData();
      if (this.userExists()) { return; }

      this.createAndSaveClient();
      localStorage.setItem("showPopup", "1");
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
div h2 {
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

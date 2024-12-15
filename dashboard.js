const app = document.getElementById("app")
const topBar = document.querySelector("#top-bar")
const header = document.getElementsByClassName("header")
const spantags = document.getElementsByTagName("span")
const aside = document.querySelector("aside")
const main = document.querySelector("main")
const menuItems = document.querySelectorAll("li")
const heading = document.querySelector("h1")
const footer = document.querySelector("footer")
const viewMembers = document.querySelector("#view-members")
const addMember = document.querySelector("#add-member")
const updateMember = document.querySelector("#update-member")
const form = document.querySelector("#form-add-member")
const table = document.querySelector("table")
const tableContainer = document.getElementById("data")

document.getElementById("notification").remove()

// Data Functions
const getData = async (fn) => {
  try {
    const response = await fetch("data.json")
    const data = await response.json()
    return fn(data)
  } catch (error) {
    console.error("Could not find file")
  }
}
// Display Members
const displayData = (data) => {
  const members = data.map((member) => {
    const tr = document.createElement("tr")
    // Create the td
    for (prop in member) {
      const td = document.createElement("td")
      td.textContent = member[prop]
      tr.appendChild(td)
    }
    return tr
  })
  // Add the members to DOM
  const tbody = document.querySelector("tbody")
  members.forEach((member) => {
    tbody.appendChild(member)
  })
}
getData(displayData)

// Signin-Register
const signIn = spantags[0]
const register = spantags[1]
signIn.setAttribute("data", "0")
register.setAttribute("data", "1")

// Date - TopBar
const dateDiv = document.createElement("div")
dateDiv.setAttribute("id", "date-div")
dateDiv.textContent = new Date().toDateString()
app.insertBefore(dateDiv, topBar)

// Header
const newHeading = document.createElement("h2")
newHeading.textContent = "Dashboard"

// Navigation
const nav = document.querySelector("nav")
nav.removeChild(nav.firstElementChild)
aside.replaceChild(newHeading, heading)

// Footer
const footerParagraph = document.createElement("p")
const currentYear = new Date().getFullYear()
footerParagraph.innerHTML = `<p>&#169; Copyright ${currentYear} TrippleX </p>`
footer.appendChild(footerParagraph)

// Update Button
const update_button = document.createElement("button")
update_button.textContent = "update"
update_button.setAttribute("hidden", true)
tableContainer.appendChild(update_button)

// Event Listeners
viewMembers.addEventListener("click", handleViewMembers)
addMember.addEventListener("click", handleAddMembers)
updateMember.addEventListener("click", handleUpdateMembers)
form.addEventListener("submit", handleSubmit)

//Event Handler Functions
function handleViewMembers() {
  //table.toggleAttribute("hidden")
  // if table is in view get new data and reload the browser
  form.setAttribute("hidden", true)
  table.removeAttribute("hidden")
  if (!table.hasAttribute("hidden")) {
    getData(function () {
      window.location.reload()
    })
  } else {
    update_button.setAttribute("hidden", true)
  }
}
function handleAddMembers() {
  form.removeAttribute("hidden")
  update_button.setAttribute("hidden", true)
  table.setAttribute("hidden", true)
}
function handleUpdateMembers() {
  const updatedData = []
  function fn(obj) {
    updatedData.push(obj)
  }
  // Manage table display
  if (table.hasAttribute("hidden")) {
    table.removeAttribute("hidden")
  }
  if (!form.hasAttribute("hidden")) {
    form.setAttribute("hidden", true)
  }

  // Check if table is not empty before updating
  getData(isData).then((result) => {
    if (result) {
      updateMembers(table, fn)
    }
  })
  update_button.addEventListener("click", (e) => console.log(updatedData))
  update_button.removeAttribute("hidden")
}
function handleDeleteMembers() {
  // Todo: Implement
}
async function handleSubmit(event) {
  event.preventDefault()
  const formData = new FormData(form)
  const formDataObject = {}
  formData.forEach((value, key) => (formDataObject[key] = value))
  await addNewMember(formDataObject)
  form.reset()
}

//CRUD Functions
async function addNewMember(data) {
  const url = "http://localhost:3000/add-data"
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    // Check type of content to make sure its json
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!")
    }
    const jsonObject = await response.json()
    const message = jsonObject["message"]
    if (jsonObject["success"]) {
      addFlashNotification(message, "success", 800)
    }
  } catch (error) {
    console.error(error.message)
  }
}
function updateMembers(table, saveData) {
  const rows = table.querySelectorAll("tr")
  for (let row = 0; row < rows.length; row++) {
    const fields = rows[row].childNodes
    // Make all fields(td) editable except the id field
    for (let i = 0; i < fields.length - 1; i++) {
      fields[i].contentEditable = true
      fields[i].addEventListener("mouseout", (e) => {
        //Build data object
        const updateDataObj = {}
        updateDataObj.id =
          rows[row].childNodes[rows[row].childNodes.length - 1].textContent
        updateDataObj.index = i
        updateDataObj.value = e.target.textContent
        //Save data object
        saveData(updateDataObj)
      })
    }
  }
}

// Notification Feature
function addFlashNotification(message, type = "info", duration = 5000) {
  // Create the flash div
  const app = document.getElementById("app")
  const topBar = document.getElementById("top-bar")
  const div = document.createElement("div")
  div.className = `notifications ${type}`
  div.textContent = message
  // Insert notification
  app.insertBefore(div, topBar)
  // Remove notification
  removeNotification(div, duration)
}
async function removeNotification(div, duration) {
  await sleep(duration)
  div.classList.add("fade-out")
  await sleep(duration / 2)
  app.removeChild(div)
}

// Utility functions
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isData(data) {
  if (data.length === 0) return false
  return true
}
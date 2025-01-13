let dutyReportReplyURL = "Your URL Here";

let paperworkData = [];
let editIndex = null;

function calculateShiftDuration() {
  const sowInput = document.getElementById("sow");
  const eowInput = document.getElementById("eow");

  if (sowInput.value && eowInput.value) {
    const sow = new Date(sowInput.value);
    const eow = new Date(eowInput.value);

    if (eow > sow) {
      const durationMs = eow - sow;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      // Format date as DD/Mon/YYYY
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const day = sow.getDate().toString().padStart(2, "0");
      const month = months[sow.getMonth()];
      const year = sow.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      // Format local time (HH:mm)
      const sowHours = sow.getHours().toString().padStart(2, "0");
      const sowMinutes = sow.getMinutes().toString().padStart(2, "0");
      const sowTime = `${sowHours}:${sowMinutes}`;

      return {
        date: formattedDate, // Use the new date format
        sowTime: sowTime, // Local time
        duration: `${hours}h ${minutes}m`,
      };
    } else {
      alert("End of Watch must be after Start of Watch.");
    }
  }
  return null;
}

function addNote() {
  const input = document.getElementById("note-input");
  const display = document.getElementById("notes-display");

  if (input.value.trim() !== "") {
    const noteDiv = document.createElement("div");
    noteDiv.style.backgroundColor = "#444";
    noteDiv.style.padding = "10px";
    noteDiv.style.marginBottom = "5px";
    noteDiv.style.borderRadius = "5px";
    noteDiv.style.display = "flex";
    noteDiv.style.justifyContent = "space-between";
    noteDiv.style.alignItems = "center";

    const noteText = document.createElement("span");
    noteText.textContent = input.value;

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.style.marginRight = "5px";
    editButton.onclick = function () {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = noteText.textContent;
      editInput.style.marginRight = "10px";
      editInput.style.flexGrow = "1";

      editInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          saveEdit();
        }
      });

      const saveButton = document.createElement("button");
      saveButton.textContent = "Save";
      saveButton.onclick = saveEdit;

      function saveEdit() {
        if (editInput.value.trim() !== "") {
          noteText.textContent = editInput.value;
          noteDiv.replaceChild(noteText, editInput);
          buttonContainer.replaceChild(editButton, saveButton);
        }
      }

      noteDiv.replaceChild(editInput, noteText);
      buttonContainer.replaceChild(saveButton, editButton);
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
      display.removeChild(noteDiv);
    };

    const buttonContainer = document.createElement("div");
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    noteDiv.appendChild(noteText);
    noteDiv.appendChild(buttonContainer);

    display.appendChild(noteDiv);
    input.value = "";
  }
}

document
  .getElementById("note-input")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      addNote();
    }
  });

function showPaperworkForm(edit = false, index = null) {
  const formTitle = document.getElementById("paperwork-form-title");
  const typeField = document.getElementById("paperwork-type");
  const titleField = document.getElementById("paperwork-title");
  const descriptionField = document.getElementById("paperwork-description");

  if (edit && index !== null) {
    const { type, title, description } = paperworkData[index];
    formTitle.textContent = "Edit Paperwork";
    typeField.value = type;
    titleField.value = title;
    descriptionField.value = description;
    editIndex = index;
  } else {
    formTitle.textContent = "Add Paperwork";
    typeField.value = "";
    titleField.value = "";
    descriptionField.value = "";
    editIndex = null;
  }

  document.getElementById("paperwork-form").style.display = "block";
}

function closePaperworkForm() {
  document.getElementById("paperwork-form").style.display = "none";
}

function submitPaperwork() {
  const type = document.getElementById("paperwork-type").value.trim();
  const title = document.getElementById("paperwork-title").value.trim();
  const description = document
    .getElementById("paperwork-description")
    .value.trim();

  if (type && title && description) {
    if (editIndex !== null) {
      paperworkData[editIndex] = { type, title, description };
    } else {
      paperworkData.push({ type, title, description });
    }

    refreshPaperworkDisplay();
    closePaperworkForm();
  } else {
    alert("Please fill out all fields before submitting.");
  }
}

function refreshPaperworkDisplay() {
  const display = document.getElementById("paperwork-display");
  display.innerHTML = "";

  const groupedData = paperworkData.reduce((groups, item) => {
    if (!groups[item.type]) groups[item.type] = [];
    groups[item.type].push(item);
    return groups;
  }, {});

  for (const [type, items] of Object.entries(groupedData)) {
    let categoryDiv = document.createElement("div");
    categoryDiv.id = type;
    categoryDiv.style.marginBottom = "15px";

    const categoryTitle = document.createElement("h3");
    categoryTitle.textContent = type.replace(/-/g, " ").toUpperCase();
    categoryDiv.appendChild(categoryTitle);

    items.forEach((item, index) => {
      const titleDiv = document.createElement("div");
      titleDiv.style.backgroundColor = "#555";
      titleDiv.style.padding = "10px";
      titleDiv.style.marginBottom = "5px";
      titleDiv.style.borderRadius = "5px";
      titleDiv.style.display = "flex";
      titleDiv.style.justifyContent = "space-between";
      titleDiv.style.alignItems = "center";
      titleDiv.dataset.description = item.description; // Ensure the description is stored

      const titleText = document.createElement("span");
      titleText.textContent = item.title;

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.onclick = function () {
        showPaperworkForm(
          true,
          paperworkData.findIndex((data) => data === item)
        );
      };

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = function () {
        paperworkData = paperworkData.filter((data) => data !== item);
        refreshPaperworkDisplay();
      };

      const buttonContainer = document.createElement("div");
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      titleDiv.appendChild(titleText);
      titleDiv.appendChild(buttonContainer);

      categoryDiv.appendChild(titleDiv);
    });

    display.appendChild(categoryDiv);
  }
}

document.getElementById("save").addEventListener("click", function () {
  const shiftDetails = calculateShiftDuration();
  if (!shiftDetails) return;

  const arrests = document.getElementById("arrests").value || "0";
  const citations = document.getElementById("citations").value || "0";

  const notesDisplay = document.getElementById("notes-display");
  const notes = Array.from(notesDisplay.children)
    .filter((noteDiv) => noteDiv.querySelector("span"))
    .map((noteDiv) => {
      const noteText = noteDiv.querySelector("span").textContent;
      return `[*]${noteText}`;
    })
    .join("\n");

  const paperworkSections = Array.from(
    document.querySelectorAll("#paperwork-display > div")
  );
  const paperworkData = paperworkSections
    .map((category) => {
      const categoryName =
        category.querySelector("h3")?.textContent || "Unknown";
      const items = Array.from(category.querySelectorAll("div"))
        .filter((item) => item.dataset.description) // Ensure description exists
        .map((item) => {
          const title = item.querySelector("span").textContent;
          const description = item.dataset.description;
          return `[spoiler=${title}]${description}[/spoiler]`;
        })
        .join("\n");
      return `[divbox=lightblue][b]${categoryName}:[/b]\n${
        items || "[spoiler=N/A][/spoiler]"
      }\n[/divbox]`;
    })
    .join("\n");

  const bbcode = `[img]https://i.imgur.com/afzUoXM.png[/img]

[divbox=white]
[b]Date:[/b] ${shiftDetails.date}
[b]Hours on Duty: [/b] ${shiftDetails.duration}
[b]Start of watch: [/b] ${shiftDetails.sowTime}

[b]Arrests:[/b] ${arrests}
[b]Citations:[/b] ${citations}

[divbox=lightblue][b]Notes (Optional):[/b]
[list]${notes || "[*]N/A"}
[/list][/divbox]

[hr]

${paperworkData}
[/divbox]`;

  navigator.clipboard.writeText(bbcode).then(() => {
    // alert("BBCode copied to clipboard!");
  });

  window.open(dutyReportReplyURL, "_blank");
});

// Function to set the current date and time for a given input field
function setCurrentDateTime(inputId) {
  const input = document.getElementById(inputId);
  const now = new Date();
  const formattedDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  input.value = formattedDateTime;
}

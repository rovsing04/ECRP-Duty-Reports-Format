let dutyReportReplyURL = "Your link here";
const LOCAL_STORAGE_KEY = 'dutyReportData';

let paperworkData = [];
let editIndex = null;

const editIconSVG = `<svg viewBox="0 0 24 24"><path d="M17.29,3.29a1,1,0,0,0-1.42,0L14,5.17l4,4L19.88,7.29a1,1,0,0,0,0-1.42ZM12,7.17,3,16.17V21h4.83L17,9.17Z"/></svg>`;
const deleteIconSVG = `<svg viewBox="0 0 24 24"><path d="M6,19a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V7H6ZM19,4H15.5l-1-1h-5l-1,1H5V6H19Z"/></svg>`;
const saveIconSVG = `<svg viewBox="0 0 24 24"><path d="M9,16.17L4.83,12l-1.42,1.41L9,19,21,7l-1.41-1.41Z"/></svg>`;

// AVANCERET BBCODE-FUNKTION
function insertBBCode(tag, param = '') {
    const textarea = document.getElementById('note-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';

    const simpleTags = ['b', 'i', 'u', 's', 'quote', 'code', 'spoiler', 'ooc', 'me', 'sup', 'sub'];

    if (simpleTags.includes(tag)) {
        replacement = `[${tag}]${selectedText}[/${tag}]`;
    } else {
        switch (tag) {
            case 'url':
                const url = prompt("Enter the URL:", "https://");
                if (url) replacement = `[url=${url}]${selectedText || 'Link Text'}[/url]`;
                break;
            case 'img':
                replacement = `[img]${selectedText || 'https://image.url'}[/img]`;
                break;
            case 'color':
                const color = prompt("Enter color name or hex code (e.g., red or #FF0000):");
                if (color) replacement = `[color=${color}]${selectedText}[/color]`;
                break;
            case 'size':
                if (param) replacement = `[size=${param}]${selectedText}[/size]`;
                break;
            case 'list':
                 replacement = `[list=${param}]${selectedText ? '\n' + selectedText.split('\n').map(line => `[*]${line}`).join('\n') + '\n' : '\n[*]\n'}[/list]`;
                break;
            case '*':
                replacement = `[*]${selectedText}`;
                break;
            case 'highlight':
                 const highlightColor = prompt("Enter highlight color (e.g., yellow):", "yellow");
                 if(highlightColor) replacement = `[highlight=${highlightColor}]${selectedText}[/highlight]`;
                 break;
            case 'mention':
                const name = prompt("Enter name to mention:");
                if(name) replacement = `[mention]${name}[/mention]`;
                break;
        }
    }
    
    if (replacement) {
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        textarea.selectionEnd = start + replacement.length;
    }
}

function saveDataToLocalStorage() {
    const notes = Array.from(document.querySelectorAll('.note-text')).map(el => el.textContent);
    const data = {
        sow: document.getElementById('sow').value,
        eow: document.getElementById('eow').value,
        arrests: document.getElementById('arrests').value,
        citations: document.getElementById('citations').value,
        notes: notes,
        paperwork: paperworkData
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function loadDataFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (!data) return;
    document.getElementById('sow').value = data.sow || '';
    document.getElementById('eow').value = data.eow || '';
    document.getElementById('arrests').value = data.arrests || '';
    document.getElementById('citations').value = data.citations || '';
    paperworkData = data.paperwork || [];
    const display = document.getElementById("notes-display");
    display.innerHTML = '';
    if (data.notes) {
        data.notes.forEach(noteText => createNoteElement(noteText));
    }
    refreshPaperworkDisplay();
}

function updateArrestAndCitationCounts() {
  let arrestCount = paperworkData.filter(p => p.type === 'arrest-report').length;
  let citationCount = paperworkData.filter(p => p.type === 'citation-report').length;
  document.getElementById('arrests').value = arrestCount;
  document.getElementById('citations').value = citationCount;
  saveDataToLocalStorage();
}

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
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const day = sow.getDate().toString().padStart(2, "0");
      const month = months[sow.getMonth()];
      const year = sow.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const sowHours = sow.getHours().toString().padStart(2, "0");
      const sowMinutes = sow.getMinutes().toString().padStart(2, "0");
      const sowTime = `${sowHours}:${sowMinutes}`;
      return { date: formattedDate, sowTime: sowTime, duration: `${hours}h ${minutes}m` };
    } else {
      alert("End of Watch must be after Start of Watch.");
    }
  }
  return null;
}

function createNoteElement(text) {
    const display = document.getElementById("notes-display");
    const noteItem = document.createElement("div");
    noteItem.className = "note-item";
    const noteText = document.createElement("span");
    noteText.className = "note-text";
    noteText.textContent = text;
    const noteActions = document.createElement("div");
    noteActions.className = "note-actions";
    const editButton = document.createElement("button");
    editButton.className = "icon-btn";
    editButton.innerHTML = editIconSVG;
    editButton.onclick = () => {
      const editArea = document.createElement("textarea");
      editArea.value = noteText.textContent;
      editArea.style.width = "100%";
      editArea.style.height = "100px";
      const saveButton = document.createElement("button");
      saveButton.className = "icon-btn";
      saveButton.innerHTML = saveIconSVG;
      saveButton.onclick = () => {
        if (editArea.value.trim() !== "") {
          noteText.textContent = editArea.value.trim();
          noteItem.replaceChild(noteText, editArea);
          noteActions.replaceChild(editButton, saveButton);
          saveDataToLocalStorage();
        }
      };
      noteItem.replaceChild(editArea, noteText);
      noteActions.replaceChild(saveButton, editButton);
    };
    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-btn";
    deleteButton.innerHTML = deleteIconSVG;
    deleteButton.onclick = () => {
      display.removeChild(noteItem);
      saveDataToLocalStorage();
    };
    noteActions.appendChild(editButton);
    noteActions.appendChild(deleteButton);
    noteItem.appendChild(noteText);
    noteItem.appendChild(noteActions);
    display.appendChild(noteItem);
}

function addNote() {
  const textarea = document.getElementById("note-input");
  if (textarea.value.trim() !== "") {
    createNoteElement(textarea.value.trim());
    textarea.value = "";
    saveDataToLocalStorage();
  }
}

// document.getElementById("note-input").addEventListener("keydown", function(event) {
//     if (event.key === "Enter" && !event.shiftKey) {
//         event.preventDefault();
//         addNote();
//     }
// });

function showPaperworkForm(edit = false, index = null) {
  const form = document.getElementById("paperwork-form");
  const overlay = document.querySelector(".modal-overlay");
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
  overlay.classList.add("show");
  form.classList.add("show");
}

function closePaperworkForm() {
  const form = document.getElementById("paperwork-form");
  const overlay = document.querySelector(".modal-overlay");
  form.classList.remove("show");
  overlay.classList.remove("show");
}

function submitPaperwork() {
  const type = document.getElementById("paperwork-type").value.trim();
  const title = document.getElementById("paperwork-title").value.trim();
  const description = document.getElementById("paperwork-description").value.trim();
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
    const categoryTitle = document.createElement("h3");
    categoryTitle.textContent = type.replace(/-/g, " ").toUpperCase();
    categoryDiv.appendChild(categoryTitle);
    
    items.forEach((item) => {
      const globalIndex = paperworkData.findIndex(data => data === item);
      const itemDiv = document.createElement("div");
      itemDiv.className = "paperwork-item";
      itemDiv.dataset.description = item.description;
      const titleText = document.createElement("span");
      titleText.className = "paperwork-item-title";
      titleText.textContent = item.title;
      const editButton = document.createElement("button");
      editButton.className = "icon-btn";
      editButton.innerHTML = editIconSVG;
      editButton.onclick = () => showPaperworkForm(true, globalIndex);
      const deleteButton = document.createElement("button");
      deleteButton.className = "icon-btn";
      deleteButton.innerHTML = deleteIconSVG;
      deleteButton.onclick = () => {
        paperworkData.splice(globalIndex, 1);
        refreshPaperworkDisplay();
      };
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "item-actions";
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);
      itemDiv.appendChild(titleText);
      itemDiv.appendChild(buttonContainer);
      categoryDiv.appendChild(itemDiv);
    });
    display.appendChild(categoryDiv);
  }
  updateArrestAndCitationCounts();
}

document.getElementById("save").addEventListener("click", function() {
    saveDataToLocalStorage();
    const shiftDetails = calculateShiftDuration();
    if (!shiftDetails) return;
    const arrests = document.getElementById("arrests").value || "0";
    const citations = document.getElementById("citations").value || "0";
    const notes = Array.from(document.querySelectorAll('.note-text'))
      .map(note => `[*]${note.textContent}`)
      .join('\n');
      
    const paperworkSections = Array.from(document.querySelectorAll("#paperwork-display > div"));
    const paperworkContent = paperworkSections.map(category => {
        const categoryName = category.querySelector("h3")?.textContent || "Unknown";
        const items = Array.from(category.querySelectorAll(".paperwork-item")).map(item => {
            const title = item.querySelector(".paperwork-item-title").textContent;
            const description = item.dataset.description;
            return `[spoiler=${title}]${description}[/spoiler]`;
        }).join("\n");
        return `[divbox=lightblue][size=135][b]${categoryName}:[/b][/size]\n${items || "[spoiler=N/A][/spoiler]"}\n[/divbox]`;
    }).join("\n");
    const bbcode = `[img]https://i.imgur.com/afzUoXM.png[/img]

[divbox=white]
[b]Date:[/b] ${shiftDetails.date}
[b]Hours on Duty: [/b] ${shiftDetails.duration}
[b]Start of watch: [/b] ${shiftDetails.sowTime}

[b]Arrests:[/b] ${arrests}
[b]Citations:[/b] ${citations}

[divbox=lightblue][size=135][b]Notes (Optional):[/b][/size]
[list]${notes || "[*]N/A"}
[/list][/divbox]

[hr]

${paperworkContent}
[/divbox]`;
    navigator.clipboard.writeText(bbcode).then(() => {});
    if (dutyReportReplyURL) {
        window.open(dutyReportReplyURL, "_blank");
    }
});

document.getElementById("clear").addEventListener("click", function() {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        location.reload();
    }
});

function setCurrentDateTime(inputId) {
    const input = document.getElementById(inputId);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    input.value = now.toISOString().slice(0, 16);
    saveDataToLocalStorage();
}

document.addEventListener('DOMContentLoaded', loadDataFromLocalStorage);
document.getElementById('sow').addEventListener('input', saveDataToLocalStorage);
document.getElementById('eow').addEventListener('input', saveDataToLocalStorage);

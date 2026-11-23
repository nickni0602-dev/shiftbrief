import { drawIcons } from "./icons.js";
import { firebaseReady, getDeviceAvailability, getShiftModel, inferenceSource } from "./ai.js";
import { parseBrief, promptFor, SAMPLE_BRIEF, SAMPLE_NOTES, toMarkdown } from "./brief.js";

const notes = document.querySelector("#notes");
const count = document.querySelector("#count");
const generate = document.querySelector("#generate");
const loadExample = document.querySelector("#load-example");
const enableDevice = document.querySelector("#enable-device");
const status = document.querySelector("#status");
const copy = document.querySelector("#copy");
const output = document.querySelector("#output");
const source = document.querySelector("#source");
const privacy = document.querySelector("#privacy");
const modes = [...document.querySelectorAll('[name="mode"]')];
const selectedMode = () => modes.find(mode => mode.checked).value;
let brief;
let busy = false;
const updateCount = () => { count.textContent = `${notes.value.length.toLocaleString("en-US")} / 6,000`; };

function setBusy(value) {
  busy = value;
  generate.disabled = value;
  loadExample.disabled = value;
  notes.readOnly = value;
  for (const mode of modes) mode.disabled = value;
  enableDevice.disabled = value || enableDevice.hidden;
}

function renderBrief(nextBrief, label) {
  brief = nextBrief;
  output.innerHTML = '<div class="summary"><h3>Shift summary</h3><p></p></div><div class="brief-section"><h3>Follow-up</h3><ul id="tasks" class="tasks"></ul></div><div class="brief-section"><h3>Watch items</h3><ul id="watch" class="watch"></ul></div>';
  output.querySelector(".summary p").textContent = brief.summary;
  const tasks = output.querySelector("#tasks");
  for (const { task, owner, due } of brief.actions) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    title.textContent = task;
    meta.textContent = `${owner || "Unassigned"} · ${due || "No deadline"}`;
    item.append(title, meta);
    tasks.append(item);
  }
  const watch = output.querySelector("#watch");
  for (const text of brief.watch) {
    const item = document.createElement("li");
    item.textContent = text;
    watch.append(item);
  }
  for (const [list, message] of [[tasks, "No follow-up listed."], [watch, "No watch items listed."]]) {
    if (!list.children.length) {
      const item = document.createElement("li");
      item.textContent = message;
      list.append(item);
    }
  }
  source.textContent = label;
  source.hidden = false;
  copy.disabled = false;
}

notes.addEventListener("input", updateCount);
for (const mode of modes) {
  mode.addEventListener("change", () => {
    privacy.innerHTML = '<i data-lucide="shield-check"></i>';
    privacy.append(selectedMode() === "local" ? "Notes stay on this device. Chrome may need to download its language model." : "If the device model cannot run, these notes will be sent to Firebase AI Logic.");
    drawIcons();
  });
}

function updatePreparation(state) {
  enableDevice.hidden = !firebaseReady || !["downloadable", "downloading"].includes(state);
  enableDevice.disabled = busy || enableDevice.hidden;
}

if (firebaseReady) getDeviceAvailability().then(updatePreparation).catch(() => updatePreparation("unavailable"));
else updatePreparation("unavailable");

enableDevice.addEventListener("click", async () => {
  setBusy(true);
  status.textContent = "Preparing the device model…";
  try {
    const model = await getShiftModel("local");
    await model.initializeDeviceModel(progress => {
      status.textContent = `Downloading device model · ${Math.round(progress * 100)}%`;
    });
    updatePreparation("available");
    status.textContent = "Device model ready.";
  } catch {
    status.textContent = "Chrome could not prepare the device model. Check its model availability and try again.";
  } finally {
    setBusy(false);
  }
});

loadExample.addEventListener("click", () => {
  notes.value = SAMPLE_NOTES;
  updateCount();
  if (!firebaseReady) renderBrief(SAMPLE_BRIEF, "Sample brief · No AI request sent");
  status.textContent = firebaseReady ? "Example loaded." : "Example loaded. Firebase configuration is required for live inference.";
});

generate.addEventListener("click", async () => {
  const input = notes.value.trim();
  if (!input) {
    status.textContent = "Enter some shift notes first.";
    notes.focus();
    return;
  }
  const mode = selectedMode();
  setBusy(true);
  status.textContent = "Generating handoff…";
  try {
    const model = await getShiftModel(mode);
    if (mode === "local") {
      const availability = await getDeviceAvailability();
      updatePreparation(availability);
      if (availability !== "available") {
        status.textContent = ["downloadable", "downloading"].includes(availability)
          ? "Prepare the device model, then generate your handoff."
          : "This browser has no local model available. The notes were kept on this device.";
        return;
      }
    }
    const { response } = await model.generateContent(promptFor(input));
    const nextBrief = parseBrief(response.text());
    const origin = response.inferenceSource;
    if (mode === "local" && origin !== inferenceSource.onDevice) {
      status.textContent = "Could not confirm on-device inference.";
      return;
    }
    const label = origin === inferenceSource.onDevice ? "On-device inference" : origin === inferenceSource.cloud ? "Cloud inference" : "Inference location unavailable";
    renderBrief(nextBrief, label);
    status.textContent = "Brief ready. Verify details against your notes before sharing.";
  } catch (error) {
    status.textContent = firebaseReady ? "Could not generate a brief. Check model availability and App Check, then try again." : error.message;
  } finally {
    setBusy(false);
  }
});

copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(toMarkdown(brief));
    status.textContent = "Handoff copied.";
  } catch {
    status.textContent = "Clipboard access failed. Select the handoff text to copy it.";
  }
});

drawIcons();

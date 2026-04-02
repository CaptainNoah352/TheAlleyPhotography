const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const adminMessage = document.getElementById("adminMessage");
const photoForm = document.getElementById("photoForm");
const photoFormTitle = document.getElementById("photoFormTitle");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const photoTableBody = document.getElementById("photoTableBody");
const imagePreview = document.getElementById("imagePreview");
const searchInput = document.getElementById("searchInput");
const adminCategoryFilter = document.getElementById("adminCategoryFilter");
const bulkImageUrls = document.getElementById("bulkImageUrls");
const addBulkUrlsBtn = document.getElementById("addBulkUrlsBtn");
const cloudinaryUploadBtn = document.getElementById("cloudinaryUploadBtn");
const cloudinaryFile = document.getElementById("cloudinaryFile");
const cloudinaryCloudName = document.getElementById("cloudinaryCloudName");
const cloudinaryUploadPreset = document.getElementById("cloudinaryUploadPreset");
const siteContentForm = document.getElementById("siteContentForm");
const DEFAULT_CLOUDINARY_CLOUD_NAME = "dkcve5kju";
const DEFAULT_CLOUDINARY_UPLOAD_PRESET = "wgbwc0lj";

const fields = {
  id: document.getElementById("photoId"),
  imageUrl: document.getElementById("imageUrl"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  category: document.getElementById("category"),
  sortOrder: document.getElementById("sortOrder"),
  showOnHome: document.getElementById("showOnHome"),
  isPublished: document.getElementById("isPublished"),
};

const siteSettingFields = {
  about_intro: document.getElementById("setting_about_intro"),
  about_paragraph_1: document.getElementById("setting_about_paragraph_1"),
  about_paragraph_2: document.getElementById("setting_about_paragraph_2"),
  about_pullquote: document.getElementById("setting_about_pullquote"),
  about_paragraph_3: document.getElementById("setting_about_paragraph_3"),
  about_paragraph_4: document.getElementById("setting_about_paragraph_4"),
  about_paragraph_5: document.getElementById("setting_about_paragraph_5"),
  contact_title: document.getElementById("setting_contact_title"),
  contact_subtitle: document.getElementById("setting_contact_subtitle"),
  contact_email: document.getElementById("setting_contact_email"),
  instagram_url: document.getElementById("setting_instagram_url"),
  instagram_label: document.getElementById("setting_instagram_label"),
  flickr_url: document.getElementById("setting_flickr_url"),
  location_text: document.getElementById("setting_location_text"),
  availability_text: document.getElementById("setting_availability_text"),
  response_time_text: document.getElementById("setting_response_time_text"),
};

const DEFAULT_SITE_SETTINGS = {
  about_intro: "A self-taught photographer from Connecticut, now based in Ocala, Florida — finding beauty in stillness, wildlife, and the quiet moments in between.",
  about_paragraph_1:
    "Long before I ever picked up a camera of my own, photography was already part of my life. My grandmother carried her Canon everywhere — on weekend road trips to Maine, on family vacations to Florida, and through the quiet towns of Connecticut where I grew up. I remember one trip to Disney World when she accidentally shattered a lens, and instead of being upset, she laughed about it the whole drive home. That moment stuck with me. The camera was never really about the gear — it was about being present, about noticing things, about holding onto moments that might have otherwise passed by.",
  about_paragraph_2:
    "Growing up in Connecticut, I was surrounded by places that felt like they existed in another time — colonial homes, antique storefronts, weathered wood, and soft light coming through old glass. I didn't think much of it back then, but looking back, that environment shaped the way I see the world. I've always been drawn to moments that feel timeless, the kind that carry a quiet weight without needing to say much.",
  about_pullquote: "\"A photograph can't stop time, but it can make it linger just a little longer.\"",
  about_paragraph_3:
    "Florida was always part of that story too. Those trips with my grandparents stayed with me — the wetlands, the birds, the way the light feels softer and heavier at the same time. It felt different from anything I knew growing up. Now living in Ocala, I find myself surrounded by that same feeling every day. The springs, the wildlife, the stillness in certain places — it all reminds me to slow down and really see what's in front of me.",
  about_paragraph_4:
    "Somewhere along the way, photography became my way of doing that. Not in a perfect or technical sense, but in a personal one. It's how I try to hold onto the way something felt in a moment — the light, the atmosphere, the emotion that's easy to miss if you're not paying attention.",
  about_paragraph_5:
    "I'm still early in this, still learning and figuring things out as I go, but that's part of what draws me to it. Shooting film on my Canon A-1 has taught me patience and intention, while digital gives me the freedom to move with the moment — especially when I'm chasing wildlife or changing light. No matter what I'm using, the goal stays simple: to create something that makes someone pause, even briefly, and feel something real.",
  contact_title: "Let's connect",
  contact_subtitle:
    "Whether you're interested in prints, have a collaboration in mind, or just want to say hello — I'd love to hear from you.",
  contact_email: "hello@brandonalley.photography",
  instagram_url: "https://instagram.com/the.alley.photography",
  instagram_label: "@the.alley.photography",
  flickr_url: "https://www.flickr.com/photos/204244048@N05/",
  location_text: "Ocala, Florida",
  availability_text: "Open for prints & collaborations",
  response_time_text: "Usually within 24-48 hours",
};

let allPhotos = [];
let dragSourceId = "";

function showMessage(text, type = "") {
  if (!adminMessage) return;
  adminMessage.textContent = text || "";
  adminMessage.classList.remove("error", "success");
  if (type) adminMessage.classList.add(type);
}

function setAuthUi(session) {
  const loggedIn = Boolean(session);
  if (loginSection) loginSection.hidden = loggedIn;
  if (dashboardSection) dashboardSection.hidden = !loggedIn;
  if (logoutBtn) logoutBtn.hidden = !loggedIn;
}

function resetForm() {
  if (!photoForm) return;
  photoForm.reset();
  if (cloudinaryCloudName && !cloudinaryCloudName.value.trim()) cloudinaryCloudName.value = DEFAULT_CLOUDINARY_CLOUD_NAME;
  if (cloudinaryUploadPreset && !cloudinaryUploadPreset.value.trim()) cloudinaryUploadPreset.value = DEFAULT_CLOUDINARY_UPLOAD_PRESET;
  fields.id.value = "";
  fields.sortOrder.value = "0";
  fields.isPublished.checked = true;
  photoFormTitle.textContent = "Add Photo";
  if (cancelEditBtn) cancelEditBtn.hidden = true;
  updatePreview();
}

function updatePreview() {
  if (!imagePreview || !fields.imageUrl) return;
  const src = fields.imageUrl.value.trim();
  if (!src) {
    imagePreview.removeAttribute("src");
    return;
  }
  imagePreview.src = src;
}

function photoToPayload() {
  return {
    image_url: fields.imageUrl.value.trim(),
    title: fields.title.value.trim(),
    description: fields.description.value.trim(),
    category: fields.category.value,
    sort_order: Number(fields.sortOrder.value || 0),
    show_on_home: fields.showOnHome.checked,
    is_published: fields.isPublished.checked,
  };
}

function fillForm(photo) {
  fields.id.value = photo.id;
  fields.imageUrl.value = photo.image_url;
  fields.title.value = photo.title || "";
  fields.description.value = photo.description || "";
  fields.category.value = photo.category;
  fields.sortOrder.value = String(photo.sort_order || 0);
  fields.showOnHome.checked = Boolean(photo.show_on_home);
  fields.isPublished.checked = Boolean(photo.is_published);
  photoFormTitle.textContent = "Edit Photo";
  if (cancelEditBtn) cancelEditBtn.hidden = false;
  updatePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getVisiblePhotos() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const filterCategory = adminCategoryFilter?.value || "all";
  return allPhotos.filter((photo) => {
    const matchesCategory = filterCategory === "all" || photo.category === filterCategory;
    const matchesSearch = !q || (photo.title || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
}

function buildReorderedPhotoIds(visibleOrderedIds) {
  const idQueue = [...visibleOrderedIds];
  return allPhotos.map((photo) => {
    if (visibleOrderedIds.includes(photo.id)) {
      return idQueue.shift();
    }
    return photo.id;
  });
}

async function handleDropReorder() {
  const visibleIds = Array.from(photoTableBody.querySelectorAll("tr[data-id]")).map((row) => row.dataset.id);
  if (!visibleIds.length) return;

  const reorderedIds = buildReorderedPhotoIds(visibleIds);
  await window.photoDataApi.reorderPhotos(reorderedIds);
  showMessage("Photo order saved.", "success");
  await loadPhotos();
}

function renderPhotoTable() {
  if (!photoTableBody) return;
  const rows = getVisiblePhotos();
  photoTableBody.innerHTML = "";
  if (!rows.length) {
    photoTableBody.innerHTML = '<tr><td colspan="9">No photos found.</td></tr>';
    return;
  }

  rows.forEach((photo) => {
    const tr = document.createElement("tr");
    tr.draggable = true;
    tr.dataset.id = photo.id;
    tr.innerHTML = `
      <td><span class="drag-handle" title="Drag to reorder" aria-hidden="true">⋮⋮</span></td>
      <td><img class="admin-thumb" src="${photo.image_url}" alt="${photo.title || "Photo"}" /></td>
      <td>${photo.title || "—"}</td>
      <td><a href="${photo.image_url}" target="_blank" rel="noreferrer">Open URL</a></td>
      <td>${photo.category}</td>
      <td>${photo.show_on_home ? "Yes" : "No"}</td>
      <td>${photo.is_published ? "Yes" : "No"}</td>
      <td>${photo.sort_order ?? 0}</td>
      <td>
        <button class="admin-btn admin-btn-secondary" data-action="edit" data-id="${photo.id}" type="button">Edit</button>
        <button class="admin-btn admin-btn-secondary" data-action="delete" data-id="${photo.id}" type="button">Delete</button>
      </td>
    `;
    photoTableBody.appendChild(tr);
  });
}

async function loadPhotos() {
  allPhotos = await window.photoDataApi.fetchAllPhotosForAdmin();
  renderPhotoTable();
}

function fillSiteSettingsForm(settings) {
  Object.entries(siteSettingFields).forEach(([key, node]) => {
    if (!node) return;
    const fallbackValue = DEFAULT_SITE_SETTINGS[key] || "";
    node.value = settings?.[key] || fallbackValue;
    node.placeholder = fallbackValue;
  });
}

function collectSiteSettingsFormValues() {
  const values = {};
  Object.entries(siteSettingFields).forEach(([key, node]) => {
    values[key] = node?.value?.trim() || "";
  });
  return values;
}

async function loadSiteSettings() {
  const settings = await window.photoDataApi.fetchSiteSettings();
  fillSiteSettingsForm(settings);
}

async function uploadToCloudinary() {
  const cloudName = (cloudinaryCloudName?.value || "").trim();
  const uploadPreset = (cloudinaryUploadPreset?.value || "").trim();
  const file = cloudinaryFile?.files?.[0];

  if (!cloudName) {
    showMessage("Add your Cloudinary cloud name before uploading.", "error");
    return;
  }
  if (!uploadPreset) {
    showMessage("Add your Cloudinary unsigned upload preset before uploading.", "error");
    return;
  }
  if (!file) {
    showMessage("Choose an image file to upload.", "error");
    return;
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  showMessage("Uploading image to Cloudinary...");
  cloudinaryUploadBtn.disabled = true;

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(data?.error?.message || "Cloudinary upload failed.");
    }

    fields.imageUrl.value = data.secure_url;
    updatePreview();
    showMessage("Image uploaded to Cloudinary and URL inserted.", "success");
  } catch (error) {
    showMessage(error.message || "Cloudinary upload failed.", "error");
  } finally {
    cloudinaryUploadBtn.disabled = false;
  }
}

async function initializeAdmin() {
  if (cloudinaryCloudName && !cloudinaryCloudName.value.trim()) cloudinaryCloudName.value = DEFAULT_CLOUDINARY_CLOUD_NAME;
  if (cloudinaryUploadPreset && !cloudinaryUploadPreset.value.trim()) cloudinaryUploadPreset.value = DEFAULT_CLOUDINARY_UPLOAD_PRESET;

  if (!window.photoDataApi?.hasValidSupabaseConfig || !window.photoDataApi.hasValidSupabaseConfig()) {
    showMessage("Add your Supabase URL and anon key in supabase-config.js before using admin.", "error");
    return;
  }

  const session = await window.photoDataApi.getCurrentSession();
  setAuthUi(session);
  if (session) {
    await loadPhotos();
    await loadSiteSettings();
  }

  window.photoDataApi.onAuthStateChange(async (nextSession) => {
    setAuthUi(nextSession);
    if (nextSession) {
      await loadPhotos();
      await loadSiteSettings();
    } else {
      resetForm();
      allPhotos = [];
      renderPhotoTable();
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("Signing in...");
    try {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      await window.photoDataApi.signInWithEmail(email, password);
      showMessage("Signed in.", "success");
    } catch (error) {
      showMessage(error.message || "Unable to sign in.", "error");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await window.photoDataApi.signOutAdmin();
      showMessage("Logged out.", "success");
    } catch (error) {
      showMessage(error.message || "Unable to logout.", "error");
    }
  });
}

if (fields.imageUrl) {
  fields.imageUrl.addEventListener("input", updatePreview);
}

if (cloudinaryUploadBtn) {
  cloudinaryUploadBtn.addEventListener("click", uploadToCloudinary);
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => {
    resetForm();
  });
}

if (photoForm) {
  photoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = photoToPayload();
    if (!payload.image_url) {
      showMessage("Image URL is required.", "error");
      return;
    }
    try {
      if (fields.id.value) {
        await window.photoDataApi.updatePhoto(fields.id.value, payload);
        showMessage("Photo updated.", "success");
      } else {
        await window.photoDataApi.createPhoto(payload);
        showMessage("Photo added.", "success");
      }
      resetForm();
      await loadPhotos();
    } catch (error) {
      showMessage(error.message || "Unable to save photo.", "error");
    }
  });
}

if (siteContentForm) {
  siteContentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const values = collectSiteSettingsFormValues();
      await window.photoDataApi.saveSiteSettings(values);
      showMessage("Site content saved.", "success");
    } catch (error) {
      showMessage(error.message || "Unable to save site content.", "error");
    }
  });
}

if (photoTableBody) {
  photoTableBody.addEventListener("click", async (event) => {
    const target = event.target.closest("button[data-action]");
    if (!target) return;
    const id = target.dataset.id;
    const action = target.dataset.action;
    const photo = allPhotos.find((entry) => entry.id === id);
    if (!photo) return;

    if (action === "edit") {
      fillForm(photo);
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm("Delete this photo? This action cannot be undone.");
      if (!confirmed) return;
      try {
        await window.photoDataApi.deletePhoto(id);
        showMessage("Photo deleted.", "success");
        await loadPhotos();
      } catch (error) {
        showMessage(error.message || "Unable to delete photo.", "error");
      }
    }
  });

  photoTableBody.addEventListener("dragstart", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    dragSourceId = row.dataset.id;
    row.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  photoTableBody.addEventListener("dragend", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (row) row.classList.remove("is-dragging");
    photoTableBody.querySelectorAll("tr.drag-over").forEach((node) => node.classList.remove("drag-over"));
  });

  photoTableBody.addEventListener("dragover", (event) => {
    event.preventDefault();
    const targetRow = event.target.closest("tr[data-id]");
    if (!targetRow || targetRow.dataset.id === dragSourceId) return;

    photoTableBody.querySelectorAll("tr.drag-over").forEach((node) => node.classList.remove("drag-over"));
    targetRow.classList.add("drag-over");
  });

  photoTableBody.addEventListener("drop", async (event) => {
    event.preventDefault();
    const targetRow = event.target.closest("tr[data-id]");
    const draggedRow = photoTableBody.querySelector(`tr[data-id="${dragSourceId}"]`);
    if (!targetRow || !draggedRow || targetRow === draggedRow) return;

    const targetRect = targetRow.getBoundingClientRect();
    const dropAfter = event.clientY > targetRect.top + targetRect.height / 2;

    if (dropAfter) {
      targetRow.after(draggedRow);
    } else {
      targetRow.before(draggedRow);
    }

    targetRow.classList.remove("drag-over");

    try {
      await handleDropReorder();
    } catch (error) {
      showMessage(error.message || "Unable to save photo order.", "error");
      await loadPhotos();
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("input", renderPhotoTable);
}

if (adminCategoryFilter) {
  adminCategoryFilter.addEventListener("change", renderPhotoTable);
}

if (addBulkUrlsBtn) {
  addBulkUrlsBtn.addEventListener("click", async () => {
    const rawValue = (bulkImageUrls?.value || "").trim();
    if (!rawValue) {
      showMessage("Add at least one URL in the bulk field.", "error");
      return;
    }

    const urls = rawValue
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!urls.length) {
      showMessage("No valid URLs found.", "error");
      return;
    }

    try {
      let addedCount = 0;
      for (const url of urls) {
        await window.photoDataApi.createPhoto({
          image_url: url,
          title: "",
          description: "",
          category: fields.category.value,
          sort_order: 0,
          show_on_home: fields.showOnHome.checked,
          is_published: fields.isPublished.checked,
        });
        addedCount += 1;
      }
      if (bulkImageUrls) bulkImageUrls.value = "";
      showMessage(`Added ${addedCount} photo URL${addedCount === 1 ? "" : "s"}.`, "success");
      await loadPhotos();
    } catch (error) {
      showMessage(error.message || "Unable to bulk add photo URLs.", "error");
    }
  });
}

initializeAdmin().catch((error) => {
  showMessage(error.message || "Admin failed to initialize.", "error");
});

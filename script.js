console.log("DevTrack JavaScript loaded");
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBj4U-m26t98xnxJ_YxyG5LVcYJqJRGdVE",
    authDomain: "devtrack-12077.firebaseapp.com",
    projectId: "devtrack-12077",
    storageBucket: "devtrack-12077.firebasestorage.app",
    messagingSenderId: "973908914999",
    appId: "1:973908914999:web:58c030fbf342834bad20b2",
    measurementId: "G-1JMFJB3VYP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const projectGrid = document.getElementById("projectGrid");
const noResults = document.getElementById("noResults");

const projectForm = document.getElementById("projectForm");
const projectName = document.getElementById("projectName");
const projectStatus = document.getElementById("projectStatus");
const projectTech = document.getElementById("projectTech");

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

let projects = [];

menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
    });
});

async function loadProjects() {
    try {
        const querySnapshot = await getDocs(collection(db, "projects"));

        projects = [];

        querySnapshot.forEach(document => {
            projects.push({
                id: document.id,
                ...document.data()
            });
        });

        renderProjects();
    } catch (error) {
        console.error("Error loading projects:", error);
        projectGrid.innerHTML = "<p>Unable to load projects.</p>";
    }
}

function renderProjects() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const filterValue = filterSelect.value;

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchValue) ||
            project.tech.toLowerCase().includes(searchValue);

        const matchesFilter =
            filterValue === "all" ||
            project.status === filterValue;

        return matchesSearch && matchesFilter;
    });

    projectGrid.innerHTML = "";

    if (filteredProjects.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    filteredProjects.forEach(project => {
        const card = document.createElement("div");
        card.className = "project-card";

        card.innerHTML = `
            <div class="project-card-top">
                <span class="project-status ${project.status.toLowerCase()}">
                    ${project.status}
                </span>
                <button class="delete-project" data-id="${project.id}">
                    Delete
                </button>
            </div>

            <h3>${escapeHTML(project.name)}</h3>

            <p class="project-tech">
                ${escapeHTML(project.tech)}
            </p>

            <div class="project-card-bottom">
                <span>DevTrack Project</span>
            </div>
        `;

        projectGrid.appendChild(card);
    });

    document.querySelectorAll(".delete-project").forEach(button => {
        button.addEventListener("click", async () => {
            const id = button.dataset.id;

            const confirmed = confirm("Delete this project?");

            if (!confirmed) {
                return;
            }

            await deleteProject(id);
        });
    });
}

async function deleteProject(id) {
    try {
        await deleteDoc(doc(db, "projects", id));

        projects = projects.filter(project => project.id !== id);

        renderProjects();
    } catch (error) {
        console.error("Error deleting project:", error);
        alert("Unable to delete project.");
    }
}

projectForm.addEventListener("submit", async event => {
    console.log("Add Project form submitted");
    event.preventDefault();

    const name = projectName.value.trim();
    const status = projectStatus.value;
    const tech = projectTech.value.trim();

    if (!name || !tech) {
        return;
    }

  console.log("Trying to save project...");

const projectData = {
    name: name,
    status: status,
    tech: tech,
    createdAt: new Date().toISOString()
};

    try {
        const documentReference = await addDoc(
            collection(db, "projects"),
            projectData
        );

        projects.push({
            id: documentReference.id,
            ...projectData
        });

        projectForm.reset();

        renderProjects();

        alert("Project added successfully.");
    } catch (error) {
        console.error("Error adding project:", error);
        alert("Unable to save project.");
    }
});

searchInput.addEventListener("input", renderProjects);

filterSelect.addEventListener("change", renderProjects);

contactForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
        formMessage.textContent = "Please fill in all fields.";
        return;
    }

    formMessage.textContent = "Message sent successfully.";

    contactForm.reset();
});

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

loadProjects();
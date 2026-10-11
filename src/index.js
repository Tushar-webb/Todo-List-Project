import { initProjects } from "./liveData.js";
import { displayProjects, displayTasksCreator, setupProjectForm } from "./dom.js";

const havePersistentData = initProjects();
displayProjects();
if (!havePersistentData) {
    displayTasksCreator("default", 0);
}
setupProjectForm();
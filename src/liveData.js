import { saveProjects, loadProjects } from "./persistentData.js";

let myProjects;

function save() {
    saveProjects(myProjects);
}

export function initProjects() {
    const stored = loadProjects();

    if (stored !== null) {
        myProjects = stored;
        return true;
    }

    myProjects = [{
        nameOfProject: "default",
        projectUniqueId: crypto.randomUUID(),
        tasks: []
    }];
    save();
    return false;
}

export function getProjects() {
    return myProjects;
}

// ---------- Projects ----------

export function addProject(name) {
    myProjects.push({
        nameOfProject: name,
        projectUniqueId: crypto.randomUUID(),
        tasks: []
    });
    save();
}

export function deleteProject(projectIndex) {
    myProjects.splice(projectIndex, 1);
    save();
}

// ---------- Tasks ----------

export function addTask(projectIndex, taskData) {
    myProjects[projectIndex].tasks.push({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        notes: taskData.notes,
        checkbox: false,
        taskUniqueId: crypto.randomUUID()
    });
    save();
}

export function toggleTask(projectIndex, taskIndex, checked) {
    myProjects[projectIndex].tasks[taskIndex].checkbox = checked;
    save();
}

export function updateTask(projectIndex, taskIndex, newData) {
    const oldTask = myProjects[projectIndex].tasks[taskIndex];

    myProjects[projectIndex].tasks[taskIndex] = {
        title: newData.title,
        description: newData.description,
        dueDate: newData.dueDate,
        priority: newData.priority,
        notes: newData.notes,
        checkbox: oldTask.checkbox,
        taskUniqueId: oldTask.taskUniqueId
    };
    save();
}

export function deleteTask(projectIndex, taskIndex) {
    myProjects[projectIndex].tasks.splice(taskIndex, 1);
    save();
}
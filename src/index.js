import { format, parse } from "date-fns"; //we don't mention packages in config files like webpack eg-> webpack.dev.js, etc. installating a package automatically mentions the package in the package.json file, and that enough(no need to mention anywhere else).

let myProjects;

if (localStorage.getItem("myProjects") != null) {
    myProjects = JSON.parse(localStorage.getItem("myProjects"));
    displayProjects();
}
else {
    myProjects = [];
    myProjects.push({
        nameOfProject: "default",
        projectUniqueId: crypto.randomUUID(),
        tasks: []
    });
    localStorage.setItem("myProjects", JSON.stringify(myProjects));

    displayProjects();
    displayTasksCreator("default", 0);
}

const projectsCreatorForm = document.getElementById("projectsCreator");
projectsCreatorForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const projectName = document.getElementById("projectName").value;
    myProjects.push({ nameOfProject: projectName, projectUniqueId: crypto.randomUUID(), tasks: [] });
    localStorage.setItem("myProjects", JSON.stringify(myProjects));

    displayProjects();
    projectsCreatorForm.reset();
});

function displayProjects() {
    const projectCardsContainer = document.querySelector("#projectCardsContainer");
    projectCardsContainer.innerHTML = "";

    myProjects = JSON.parse(localStorage.getItem("myProjects"));
    myProjects.forEach((project) => {
        const projectCard = document.createElement("div");
        projectCard.className = "projectCard";
        projectCard.dataset.uniqueId = project.projectUniqueId;
        projectCard.addEventListener('click', (e) => {
            e.stopPropagation();

            const projectCardUniqueId = e.currentTarget.dataset.uniqueId;
            const projectCardIndex = myProjects.findIndex(
                (project) => project.projectUniqueId === projectCardUniqueId
            );

            displayTasksCreator(project.nameOfProject, projectCardIndex);
            displayTasks(projectCardIndex);
        });


        const projectCardTitle = document.createElement("h3");
        projectCardTitle.textContent = project.nameOfProject;

        const projectCardDeleteBtn = document.createElement("button");
        projectCardDeleteBtn.textContent = "Delete";
        projectCardDeleteBtn.className = "projectCardDeleteBtn";
        projectCardDeleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectCardUniqueId = e.target.parentElement.dataset.uniqueId;
            const projectCardIndex = myProjects.findIndex(
                (project) => project.projectUniqueId === projectCardUniqueId
            );

            myProjects.splice(projectCardIndex, 1);
            localStorage.setItem("myProjects", JSON.stringify(myProjects));
            displayProjects();
            if (myProjects.length === 0) {
                displayTasksCreator("doesNotMatter", -1);
            }
            else {
                if (projectCardIndex === 0) {
                    displayTasksCreator(myProjects[projectCardIndex].nameOfProject, projectCardIndex);
                    displayTasks(projectCardIndex);
                }
                else {
                    displayTasksCreator(myProjects[projectCardIndex - 1].nameOfProject, projectCardIndex - 1);
                    displayTasks(projectCardIndex - 1);
                }
            }
        });

        projectCard.append(projectCardTitle, projectCardDeleteBtn);

        projectCardsContainer.appendChild(projectCard);
    });
}

function displayTasksCreator(passedProjectName, projectCardIndex) {
    const mainContent = document.getElementById("mainContent");
    if (projectCardIndex < 0) {
        mainContent.innerHTML = "";
        return;
    }
    mainContent.innerHTML = "";

    const tasksCreatorForm = document.createElement("form");
    tasksCreatorForm.className = "tasksCreatorForm";

    const tasksCreatorForm_title = Object.assign(document.createElement("input"), {
        type: "text",
        className: "tasksCreatorForm_title",
        maxLength: 10,
        required: true,
        placeholder: "Task title"
    });

    const tasksCreatorForm_description = Object.assign(document.createElement("textarea"), {
        className: "tasksCreatorForm_description",
        maxLength: 60,
        required: true,
        placeholder: "Description"
    });

    let tasksCreatorForm_dueDate = Object.assign(document.createElement("input"), {
        type: "date",
        className: "tasksCreatorForm_dueDate",
        required: true
    });

    const tasksCreatorForm_priority = Object.assign(document.createElement("select"), {
        className: "tasksCreatorForm_priority",
        required: true
    });
    tasksCreatorForm_priority.append(
        Object.assign(document.createElement("option"), {
            value: "Low",
            textContent: "Priority: Low"
        }),
        Object.assign(document.createElement("option"), {
            value: "Mid",
            textContent: "Priority: Mid"
        }),
        Object.assign(document.createElement("option"), {
            value: "High",
            textContent: "Priority: High"
        })
    );

    const tasksCreatorForm_notes = Object.assign(document.createElement("textarea"), {
        className: "tasksCreatorForm_notes",
        required: true,
        placeholder: "notes"
    });

    const tasksCreatorForm_submitButton = Object.assign(document.createElement("button"), {
        type: "submit",
        className: "tasksCreatorForm_submitButton",
        textContent: "Submit"
    });

    tasksCreatorForm.append(tasksCreatorForm_title, tasksCreatorForm_description, tasksCreatorForm_dueDate, tasksCreatorForm_priority, tasksCreatorForm_notes, tasksCreatorForm_submitButton);
    mainContent.append(tasksCreatorForm);
    const tasksCreatorFormHeading = document.createElement("div");
    tasksCreatorFormHeading.textContent = "Create a task for the " + passedProjectName + " project";
    tasksCreatorFormHeading.className = "tasksCreatorFormHeading";
    tasksCreatorForm.before(tasksCreatorFormHeading);

    tasksCreatorForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const rawValue = tasksCreatorForm_dueDate.value;
        const dateObj = new Date(rawValue);    // convert string → Date object first
        const formattedDate = format(dateObj, "MMMM dd, yyyy");

        myProjects[projectCardIndex].tasks.push({
            title: tasksCreatorForm_title.value,
            description: tasksCreatorForm_description.value,
            dueDate: formattedDate,
            priority: tasksCreatorForm_priority.value,
            notes: tasksCreatorForm_notes.value,
            checkbox: false,
            taskUniqueId: crypto.randomUUID()
        });
        localStorage.setItem("myProjects", JSON.stringify(myProjects));

        displayTasks(projectCardIndex);
        tasksCreatorForm.reset();
    });
}

let taskCardsContainer = document.createElement("div");
taskCardsContainer.id = "taskCardsContainer";

function displayTasks(projectCardIndex) {

    taskCardsContainer.innerHTML = "";

    myProjects[projectCardIndex].tasks.forEach((taskObject) => {

        const taskCardTitle = Object.assign(document.createElement("div"), {
            textContent: "The task " + taskObject.title.toUpperCase() + " has",
            className: "taskCardTitle"
        });

        let taskCardPriority;
        if (taskObject.priority == "High") {
            taskCardPriority = Object.assign(document.createElement("div"), {
                textContent: "high priority",
                className: "ifTaskCardHasHighPriority"
            });
        }
        else if (taskObject.priority == "Mid") {
            taskCardPriority = Object.assign(document.createElement("div"), {
                textContent: "mid priority",
                className: "ifTaskCardHasMidPriority"
            });
        }
        else {
            taskCardPriority = Object.assign(document.createElement("div"), {
                textContent: "low priority",
                className: "ifTaskCardHasLowPriority"
            });
        }

        const taskCardDueDate = Object.assign(document.createElement("div"), {
            textContent: "and should be completed by " + taskObject.dueDate,
            className: "taskCardDueDate"
        });

        const taskCard_CheckboxLabel = document.createElement("div");
        taskCard_CheckboxLabel.textContent = "Completed! ";
        taskCard_CheckboxLabel.className = "taskCard_CheckboxLabel";

        const taskCard_isTaskCompletedCheckbox = Object.assign(document.createElement("input"), {
            type: "checkbox",
            className: "taskCard_isTaskCompletedCheckbox",
            checked: taskObject.checkbox
        });

        taskCard_isTaskCompletedCheckbox.addEventListener('click', function (e) {
            const taskCardUniqueId = e.target.parentElement.parentElement.dataset.uniqueId;
            const taskCardIndex = myProjects[projectCardIndex].tasks.findIndex(
                (task) => task.taskUniqueId === taskCardUniqueId
            );

            myProjects[projectCardIndex].tasks[taskCardIndex].checkbox =
                taskCard_isTaskCompletedCheckbox.checked;
            localStorage.setItem("myProjects", JSON.stringify(myProjects));
        });

        const taskCard_editViewBtn = Object.assign(document.createElement("button"), {
            type: "button",
            className: "taskCard_editViewBtn",
            textContent: "View/Edit"
        });

        taskCard_editViewBtn.addEventListener('click', function (e) {
            const taskCardUniqueId = e.target.parentElement.parentElement.dataset.uniqueId;
            const taskCardIndex = myProjects[projectCardIndex].tasks.findIndex(
                (task) => task.taskUniqueId === taskCardUniqueId
            );

            const taskCard_updateForm_title = Object.assign(document.createElement("input"), {
                type: "text",
                className: "taskCard_updateForm_title",
                maxLength: 10,
                required: true,
                value: myProjects[projectCardIndex].tasks[taskCardIndex].title
            });

            const taskCard_updateForm_description = Object.assign(document.createElement("textarea"), {
                className: "taskCard_updateForm_description",
                maxLength: 60,
                required: true,
                value: myProjects[projectCardIndex].tasks[taskCardIndex].description
            });

            let recover = myProjects[projectCardIndex].tasks[taskCardIndex].dueDate;
            const dateObj = parse(recover, "MMMM dd, yyyy", new Date());

            let taskCard_updateForm_dueDate = Object.assign(document.createElement("input"), {
                type: "date",
                className: "taskCard_updateForm_dueDate",
                required: true,
                value: format(dateObj, "yyyy-MM-dd")
            });

            let formattedDate = myProjects[projectCardIndex].tasks[taskCardIndex].dueDate;
            taskCard_updateForm_dueDate.addEventListener("change", () => {
                const rawValue = taskCard_updateForm_dueDate.value;
                const dateObj = new Date(rawValue);    // convert string → Date object first
                formattedDate = format(dateObj, "MMMM dd, yyyy");
            });

            const taskCard_updateForm_priority = Object.assign(document.createElement("select"), {
                className: "taskCard_updateForm_priority",
                required: true,
            });
            taskCard_updateForm_priority.append(
                Object.assign(document.createElement("option"), {
                    value: "Low",
                    textContent: "Priority: Low"
                }),
                Object.assign(document.createElement("option"), {
                    value: "Mid",
                    textContent: "Priority: Mid"
                }),
                Object.assign(document.createElement("option"), {
                    value: "High",
                    textContent: "Priority: High"
                })
            );
            taskCard_updateForm_priority.value = myProjects[projectCardIndex].tasks[taskCardIndex].priority;

            const taskCard_updateForm_notes = Object.assign(document.createElement("textarea"), {
                className: "taskCard_updateForm_notes",
                required: true,
                value: myProjects[projectCardIndex].tasks[taskCardIndex].notes
            });

            const originalCheckboxState = myProjects[projectCardIndex].tasks[taskCardIndex].checkbox;

            const taskCard_updateForm_saveBtn = Object.assign(document.createElement("button"), {
                type: "submit",
                textContent: "Save",
                className: "taskCard_updateForm_saveBtn"
            });

            const taskCard = e.target.closest(".taskCard");

            const taskCard_updateForm = document.createElement("form");
            taskCard_updateForm.className = "taskCard_updateForm";

            taskCard_updateForm.append(taskCard_updateForm_title, taskCard_updateForm_description, taskCard_updateForm_dueDate, taskCard_updateForm_priority, taskCard_updateForm_notes, taskCard_updateForm_saveBtn);

            taskCard.replaceWith(taskCard_updateForm);

            taskCard_updateForm.addEventListener('submit', function (e) {
                e.preventDefault();

                myProjects[projectCardIndex].tasks[taskCardIndex] = {
                    title: taskCard_updateForm_title.value,
                    description: taskCard_updateForm_description.value,
                    dueDate: formattedDate,
                    priority: taskCard_updateForm_priority.value,
                    notes: taskCard_updateForm_notes.value,
                    checkbox: originalCheckboxState,
                    taskUniqueId: myProjects[projectCardIndex].tasks[taskCardIndex].taskUniqueId
                };
                localStorage.setItem("myProjects", JSON.stringify(myProjects));

                displayTasks(projectCardIndex);
            });
        });

        const taskCard_deleteBtn = Object.assign(document.createElement("button"), {
            type: "button",
            className: "taskCard_deleteBtn",
            textContent: "delete it"
        });

        taskCard_deleteBtn.addEventListener('click', function (e) {
            const taskCardUniqueId = e.target.parentElement.parentElement.dataset.uniqueId;
            const taskCardIndex = myProjects[projectCardIndex].tasks.findIndex(
                (task) => task.taskUniqueId === taskCardUniqueId
            );
            myProjects[projectCardIndex].tasks.splice(taskCardIndex, 1);
            localStorage.setItem("myProjects", JSON.stringify(myProjects));
            displayTasks(projectCardIndex);
        });

        const upperPartOfTaskCard = document.createElement("div");
        upperPartOfTaskCard.className = "upperPartOfTaskCard";
        upperPartOfTaskCard.append(taskCardTitle, taskCardPriority, taskCardDueDate);

        const lowerPartOfTaskCard = document.createElement("div");
        lowerPartOfTaskCard.className = "lowerPartOfTaskCard";
        lowerPartOfTaskCard.append(taskCard_CheckboxLabel, taskCard_isTaskCompletedCheckbox, taskCard_editViewBtn, taskCard_deleteBtn);

        const taskCard = document.createElement("div");
        taskCard.className = "taskCard";
        taskCard.dataset.uniqueId = taskObject.taskUniqueId;
        taskCard.append(upperPartOfTaskCard, lowerPartOfTaskCard);
        taskCardsContainer.append(taskCard);
    });
    const tasksCreatorForm = document.querySelector(".tasksCreatorForm");
    tasksCreatorForm.after(taskCardsContainer);
}
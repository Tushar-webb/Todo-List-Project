const STORAGE_KEY = "myProjects";

export function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadProjects() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;

    return JSON.parse(stored);
}
// --- JAVASCRIPT: js/app.js (The Remastered Markdown to RTF Version - Final Polish) ---

// --- MODULE IMPORTS (for CodeMirror) ---
import { EditorState } from 'https://esm.sh/@codemirror/state';
import { EditorView, keymap } from 'https://esm.sh/@codemirror/view';
import { defaultKeymap, indentWithTab } from 'https://esm.sh/@codemirror/commands';
import { markdown, markdownLanguage } from 'https://esm.sh/@codemirror/lang-markdown';
import { LanguageDescription } from 'https://esm.sh/@codemirror/language';

// --- GLOBAL VARIABLES ---
let state = {
    notes: [],
    activeNoteId: null,
    theme: 'light',
    sidebarCollapsed: false,
};
let editor;
let searchIndex;

// --- DOM ELEMENTS ---
let noteList, newNoteBtn, editorContainer, noteTitleInput, previewContent, themeToggleBtn,
    sidebar, toggleSidebarBtnHeader, toggleSidebarBtnMain, searchInput, importBtn, exportBtn, importFileInput,
    favoriteBtn, exportNotePdfBtn, deleteNoteBtn;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    noteList = document.getElementById('note-list');
    newNoteBtn = document.getElementById('new-note-btn');
    editorContainer = document.getElementById('editor-container');
    noteTitleInput = document.getElementById('note-title-input');
    previewContent = document.getElementById('preview-content');
    themeToggleBtn = document.getElementById('theme-toggle-btn');
    sidebar = document.getElementById('sidebar');
    // Get both toggle buttons by their unique IDs
    toggleSidebarBtnHeader = document.getElementById('toggle-sidebar-btn-header');
    toggleSidebarBtnMain = document.getElementById('toggle-sidebar-btn-main');
    searchInput = document.getElementById('search-input');
    importBtn = document.getElementById('import-btn');
    exportBtn = document.getElementById('export-btn');
    importFileInput = document.getElementById('import-file-input');
    favoriteBtn = document.getElementById('favorite-btn');
    exportNotePdfBtn = document.getElementById('export-note-pdf');
    deleteNoteBtn = document.getElementById('delete-note-btn');

    initializeEditor();
    loadState();

    // On load, apply the collapsed state if it was saved
    if(state.sidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
    }

    renderNoteList();
    loadActiveNote();
    setupEventListeners();
    updateTheme(state.theme);
    buildSearchIndex();
});

// --- EDITOR LOGIC (CodeMirror) ---
function initializeEditor() {
    const startState = EditorState.create({
        doc: '',
        extensions: [
            keymap.of([defaultKeymap, indentWithTab]),
            markdown({
                base: markdownLanguage,
                codeLanguages: (info) => LanguageDescription.of(info),
            }),
            EditorView.lineWrapping,
            EditorView.updateListener.of(handleEditorUpdate)
        ]
    });

    editor = new EditorView({
        state: startState,
        parent: editorContainer,
    });
}

function handleEditorUpdate(update) {
    if (update.docChanged && state.activeNoteId) {
        const content = editor.state.doc.toString();
        renderMarkdown(content);
        const activeNote = findNoteById(state.activeNoteId);
        if (activeNote && activeNote.content !== content) {
            activeNote.content = content;
            activeNote.updatedAt = Date.now();
            clearTimeout(window.saveTimeout);
            window.saveTimeout = setTimeout(() => {
                saveState();
                updateNoteInList(state.activeNoteId);
                buildSearchIndex();
            }, 500);
        }
    }
}

// --- DATA & STATE FUNCTIONS ---
function loadState() {
    const savedState = JSON.parse(localStorage.getItem('markdown-notes-app'));
    if (savedState) {
        state = { ...state, ...savedState };
    }
}
function saveState() { localStorage.setItem('markdown-notes-app', JSON.stringify(state)); }
function findNoteById(id) { return state.notes.find(note => note.id === id); }


// --- NOTE ACTIONS ---
function createNewNote() {
    clearTimeout(window.saveTimeout);
    const newNote = { id: `note-${Date.now()}`, title: 'Untitled Note', content: '# New Note\n\nStart writing!', createdAt: Date.now(), updatedAt: Date.now(), favorite: false, };
    state.notes.unshift(newNote);
    state.activeNoteId = newNote.id;
    saveState();
    renderNoteList();
    loadActiveNote();
    buildSearchIndex();
}

function deleteActiveNote() {
    if (!state.activeNoteId) return;
    const noteToDelete = findNoteById(state.activeNoteId);
    if (confirm(`Are you sure you want to delete "${noteToDelete.title}"?`)) {
        clearTimeout(window.saveTimeout);
        state.notes = state.notes.filter(note => note.id !== state.activeNoteId);
        state.activeNoteId = null;
        saveState();
        renderNoteList();
        loadActiveNote();
        buildSearchIndex();
    }
}

function loadActiveNote() {
    clearTimeout(window.saveTimeout);
    if (!state.activeNoteId && state.notes.length > 0) {
        state.activeNoteId = state.notes[0].id;
    }
    const note = findNoteById(state.activeNoteId);
    if (note) {
        noteTitleInput.value = note.title;
        editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: note.content || '' }
        });
        renderMarkdown(note.content || '');
    } else {
        clearEditor();
    }
    updateActiveNoteInList(state.activeNoteId);
}

function clearEditor() {
    noteTitleInput.value = "";
    noteTitleInput.placeholder = "Select or create a note";
    editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: '' }
    });
    renderMarkdown('');
}

// --- UI RENDERING ---
function renderMarkdown(markdownText) {
    const rawHtml = marked.parse(markdownText, {
        highlight: (code, lang) => {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        gfm: true, breaks: true,
    });
    previewContent.innerHTML = rawHtml;
    renderMathInElement(previewContent, {
        delimiters: [ { left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false } ]
    });
}

function renderNoteList(notesToRender = state.notes) {
    noteList.innerHTML = '';
    notesToRender.sort((a, b) => b.updatedAt - a.updatedAt).forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.dataset.id = note.id;
        item.innerHTML = `<h4 class="note-item-title">${note.title}</h4><p class="note-item-date">${new Date(note.updatedAt).toLocaleString()}</p>`;
        item.addEventListener('click', () => {
            if(state.activeNoteId !== note.id) {
                state.activeNoteId = note.id;
                loadActiveNote();
            }
        });
        noteList.appendChild(item);
    });
    updateActiveNoteInList(state.activeNoteId);
}

function updateActiveNoteInList(activeId) {
    document.querySelectorAll('.note-item').forEach(item => item.classList.toggle('active', item.dataset.id === activeId));
    const isDisabled = !activeId;
    noteTitleInput.disabled = isDisabled;
    deleteNoteBtn.disabled = isDisabled;
    exportNotePdfBtn.disabled = isDisabled;
    favoriteBtn.disabled = isDisabled;
}

function updateNoteInList(noteId) {
    const note = findNoteById(noteId);
    const item = noteList.querySelector(`.note-item[data-id="${noteId}"]`);
    if (item && note) {
        item.querySelector('.note-item-title').textContent = note.title;
        item.querySelector('.note-item-date').textContent = new Date(note.updatedAt).toLocaleString();
    }
}

// --- THEMING ---
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
    state.theme = newTheme;
    saveState();
}
function updateTheme(theme) {
    document.body.className = `${theme}-mode`;
    if (state.sidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
    }
    document.getElementById('theme-link').href = `css/themes/${theme}.css`;
    document.getElementById('hljs-theme-light').disabled = (theme === 'dark');
    document.getElementById('hljs-theme-dark').disabled = (theme === 'light');
    themeToggleBtn.querySelector('i').className = `fas ${state.theme === 'light' ? 'fa-moon' : 'fa-sun'}`;
}

// --- SEARCH ---
function buildSearchIndex() {
    searchIndex = lunr(function () {
        this.ref('id'); this.field('title', { boost: 10 }); this.field('content');
        state.notes.forEach(note => { if(note) this.add(note); });
    });
}
function handleSearch(event) {
    const query = event.target.value;
    if (!query) { renderNoteList(); return; }
    try {
        const results = searchIndex.search(`*${query}*`);
        const resultNotes = results.map(result => findNoteById(result.ref));
        renderNoteList(resultNotes);
    } catch (e) { renderNoteList(); }
}

// --- IMPORT / EXPORT ---
function exportAllNotes() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement('a'); a.href = dataStr; a.download = `markdown-notes-backup-${Date.now()}.json`; a.click();
}
function importNotes(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState.notes && Array.isArray(importedState.notes)) {
                if(confirm("This will overwrite your current notes. Are you sure?")) {
                    state = importedState; saveState();
                    alert('Notes imported successfully! Reloading...'); location.reload();
                }
            } else { alert('Invalid backup file format.'); }
        } catch (error) { alert('Error reading backup file.'); }
    };
    reader.readAsText(file); event.target.value = null;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    newNoteBtn.addEventListener('click', createNewNote);
    deleteNoteBtn.addEventListener('click', deleteActiveNote);
    themeToggleBtn.addEventListener('click', toggleTheme);
    searchInput.addEventListener('input', handleSearch);
    
    // The single, simple action to toggle the sidebar
    const toggleAction = () => {
        document.body.classList.toggle('sidebar-collapsed');
        state.sidebarCollapsed = document.body.classList.contains('sidebar-collapsed');
        saveState();
    };

    // Attach that same action to both buttons
    toggleSidebarBtnHeader.addEventListener('click', toggleAction);
    toggleSidebarBtnMain.addEventListener('click', toggleAction);

    noteTitleInput.addEventListener('input', (e) => {
        if(state.activeNoteId) {
            const note = findNoteById(state.activeNoteId);
            if(note) {
                note.title = e.target.value;
                note.updatedAt = Date.now();
                saveState();
                updateNoteInList(state.activeNoteId);
                buildSearchIndex();
            }
        }
    });
    
    exportBtn.addEventListener('click', exportAllNotes);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importNotes);

    const resizer = document.getElementById('resizer');
    const leftPanel = document.querySelector('.editor-panel');
    const onMouseMove = (e) => {
        const parent = resizer.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const leftPanelWidth = e.clientX - parentRect.left;
        const leftPanelPercent = (leftPanelWidth / parentRect.width) * 100;
        if (leftPanelPercent < 15 || leftPanelPercent > 85) return;
        leftPanel.style.flexBasis = `${leftPanelPercent}%`;
    };
    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        document.body.classList.remove('is-resizing');
    };
    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        document.body.classList.add('is-resizing');
    });
}
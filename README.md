# Markdown Notes App (Markdown -> Live Preview)

A feature-rich, browser-based notes application built with vanilla HTML5, CSS3, and JavaScript. This app focuses on a classic Markdown editing experience with a real-time rendered preview, offering a fast and efficient way to write and organize notes.

![Screenshot of the Markdown to RTF App](r2placeholder.png)
*(Replace `placeholder.png` with a real screenshot of your app!)*

---

## Core Features

-   **Split-Screen Interface:** A professional layout with a Markdown code editor (CodeMirror) on the left and a live-rendered preview on the right.
-   **Full Markdown Support:** Utilizes **Marked.js** for robust parsing of GitHub Flavored Markdown, including tables, lists, and links.
-   **Code Syntax Highlighting:** Both in the editor and the preview pane, powered by **highlight.js**.
-   **LaTeX Math Equations:** Write beautiful math equations using KaTeX syntax (e.g., `$E=mc^2$`).
-   **Polished UI/UX:**
    -   Resizable columns allow you to customize your workspace.
    -   A fully collapsible sidebar saves screen real estate.
    -   A carefully designed layout that avoids UI bugs and element overlaps.
-   **Data Persistence:** All notes and UI states (theme, sidebar position) are saved to your browser's `localStorage`.
-   **Powerful Search:** Near-instant full-text search of all notes, indexed by **Lunr.js**.
-   **Custom Theming:** A sleek dark/light mode that persists across sessions.
-   **Data Management:** Easily import and export all your notes as a single JSON file for backup.

## Tech Stack

-   **Core:** HTML5, CSS3, Vanilla JavaScript (using ES Modules)
-   **Editor:** [CodeMirror 6](https://codemirror.net/)
-   **Markdown Parsing:** [Marked.js](https://marked.js.org/)
-   **Syntax Highlighting:** [highlight.js](https://highlightjs.org/)
-   **Math Equations:** [KaTeX](https://katex.org/)
-   **Client-Side Search:** [Lunr.js](https://lunrjs.com/)
-   **Icons:** [Font Awesome](https://fontawesome.com/)

## How to Run Locally

Because this project uses JavaScript ES Modules (`import` statements), you cannot simply open the `index.html` file directly in your browser using the `file:///` protocol due to browser security policies (CORS).

You must serve the files from a simple local web server. The easiest way is with Python.

1.  **Navigate to the project directory** in your terminal:
    ```bash
    cd path/to/your/markdown-notes-app
    ```

2.  **Start a local server.** If you have Python 3, run:
    ```bash
    python3 -m http.server
    ```
    (If you have an older version of Python, you might need to run `python -m SimpleHTTPServer`).

3.  **Open the application** in your web browser by navigating to:
    [http://localhost:8000](http://localhost:8000)

---
